package util;

import com.cloudbees.groovy.cps.NonCPS;
import jenkins.NodesSharedState;
import pipelines.Base;
import util.Logger;
import util.To;

class Git implements Serializable {
    def script;
    Logger log;
    Shell shell;
    CommitInfo _commitInfo;

    Git(Shell shell, Logger log = null) {
        this.script = shell.script;
        this.log = log ? log.child("git") : new Logger("git", shell.script);
        this.shell = shell;
    }

    Git(Base ci) {
        this(new Shell(ci.script), ci.log);
    }

    String checkout() {
        def script = this.script;
        def log = this.log.child("checkout");

        log.info("--- checking out ---");
        script.checkout script.scm;
    }

    CommitInfo getCommitInfo() {
        def log = this.log.child("getCommitInfo");
        if (!this._commitInfo) {
            log.info("--- finding current commit info ---");
            this._commitInfo = CommitInfo.from(this.shell);
        }

        log.info("commit info", this._commitInfo.toString());
        return this._commitInfo;
    }

    String getBranch() {
        return this.script.env.BRANCH_NAME;
    }


    List getAuthorEmails() {
        if (this.getBranch() == "master") {
            def ancestor = this.getAncestorSha();
            String emailsStr = this.shell.eval("git log ${ancestor}..${this.getCommitInfo().sha} --pretty=%aE");
            List emails = [emailsStr.split('\n')].flatten().unique();
            return emails;
        }
        return [this.getCommitInfo().authorEmail];
    }

    String commonAncestorTo(String branch, String parent) {
        def log = this.log.child("commonAncestorTo");

        log.info("--- comparing sha of ${branch} to parent: ${parent} ---");
        def shas = this.shell.eval("git rev-parse origin/${parent} && git rev-parse origin/${branch}").split('\n');
        if (shas[0] == shas[1]) {
            log.info("branch sha is the same as the master");
            return shas[0];
        }

        log.info("--- finding common ancestor commit between ${parent} and ${branch} ---");

        def tries = 0;
        def commonAncestorCommits = ["origin/${branch}", "origin/${parent}"];
        while (
            commonAncestorCommits.size() > 1
            && tries++ < 3
        ) {
            commonAncestorCommits = parentCommits(
                commonAncestorCommits[0],
                commonAncestorCommits[commonAncestorCommits.size() - 1]
            );
            log.info("try #${tries}:", commonAncestorCommits);
        };
        assert commonAncestorCommits.size() == 1, 'Could not find a single ancestor after 3 tries';

        def commonAncestorCommit = commonAncestorCommits[0];
        assert commonAncestorCommit.length(), "must have a common ancestor with master";

        log.info("found common ancestor - ", commonAncestorCommit);
        return commonAncestorCommit;
    }

    List<String> parentCommits(String branch, String parent) {
        return [
            this.shell.eval(
                //TRICKY:
                // see: https://stackoverflow.com/questions/1527234/finding-a-branch-point-with-git
                //   not the popular answer - I tested them all.
                //   see the one about rev-list.
                [
                    "git rev-list --boundary ${branch}...${parent}",
                    "grep \"^-\"",
                    "cut -c2-",
                ].join(' | '),
                //TRICYEnd
            )
            .split("\n"),
        ].flatten();
    }

    List<String> modifiedFrom(String parentCommit, List<String> workspaces) {
        def log = this.log.child("modifiedFrom");
        log.info("--- finding modified projects since ${parentCommit} ---");

        def str = this.shell.eval(
            [
                "git diff --name-only ${parentCommit}",
                "grep -P -e '^(${workspaces.join('|')})'",
                "grep -v local-npm",
                "cat", //TRICKY - suppresses exit-code 1 by grep when no diff files
            ].join(' | '),
        );

        def modified = [str.split("\n")].flatten().findAll{ it -> 0 < it.length() };
        log.info("--- found modifications since ${parentCommit}:", modified);

        return modified;
    }

    List<String> getModifications(String branch, List<String> workspaces) {
        def lastRc = 'irrelevant';
        def ancestor = this.getAncestorSha();

        def modifications = this.modifiedFrom(ancestor, workspaces);

        def projectPaths = modifications.collect({ file ->
            //return just the `namespace/project` part
            file.substring(0, file.indexOf("/", file.indexOf("/") + 1))
        }).unique();

        this.log.info('detected modifications', [
            branch: branch,
            workspaces: workspaces,
            lastRcSha: lastRc,
            ancestorSha: ancestor,
            modifications: modifications,
            projectPaths: projectPaths,
        ]);

        return projectPaths;
    }

    String whoIsTheAncestor(String commitA, String commitB) {
        return this.shell.eval("""\
            [ "\$(git rev-list ${commitA} | grep \$(git rev-parse ${commitB}))" != "" ] && echo ${commitB}\
            || (\
                [ "\$(git rev-list ${commitB} | grep \$(git rev-parse ${commitA}))" != "" ] && echo ${commitA} \
                || echo ""\
            )""",
        );
    }

    String getLastSuccessfulRcSha() {
        return this.shell.eval("cat ${NodesSharedState.lastSuccessfulRcShaFilePath} || git rev-parse origin/master~1")
    }

    String getAncestorSha(String branch = null) {
        if (!branch) branch = this.getBranch();
        if ('master' == branch) {
            def lastRc = this.getLastSuccessfulRcSha();
            return this.whoIsTheAncestor("HEAD~1", lastRc);
        } else {
            return this.commonAncestorTo(branch, 'master');
        }
    }
}

class CommitInfo implements Serializable {
    //--- static --------------------
    static final formatParts = ['%H', '%an', '%ae', '%aI', '%cn', '%ce', '%cI', '%B'];
    static final separator = '~.~';
    static CommitInfo from(Shell shell) {
        def format = formatParts.join(separator);
        def parts = shell.eval("git log -1 --pretty=format:${format}").split(separator);

        //TBD: find it dynamically?
        def repoUrl = "https://github.com/getjaco/ruadan_single_repo";

        return new CommitInfo(parts, repoUrl);
    }

    //--- members -------------------
    String repoUrl;
    String repoName;
    String authorName;
    String authorEmail;
    String authorDate;
    String comment;
    String committerName;
    String committerEmail;
    String committerDate;
    List forcedPaths;
    String sha;
    String shortSha;
    boolean skipSanity;
    boolean skipSmokeTest;
    boolean verboseStages;

    CommitInfo(parts, repoUrl) {
        this.repoUrl = repoUrl;
        this.repoName = repoUrl.replaceAll("\\.git", "").replaceAll(/^.*\//,"");
    
        def i = 0;
        this.sha = parts[i++];
        this.shortSha = this.sha.substring(0, 10);
        this.authorName = parts[i++];
        this.authorEmail = parts[i++];
        this.authorDate = parts[i++];
        this.committerName = parts[i++];
        this.committerEmail = parts[i++];
        this.committerDate = parts[i++];
        this.comment = parts[i++];

        this.parseCommitDirectives(this.comment);
    }

    @NonCPS
    void parseCommitDirectives(comment) {
        def upper = comment.toUpperCase();

        this.verboseStages = upper.contains("@VERBOSE");
        this.skipSmokeTest = upper.contains("@NO-SMOKE-TEST");
        this.skipSanity = upper.contains("@NO-SANITY");

        def ixForce = upper.indexOf("@FORCE");
        if (ixForce != -1) {
            def terminator = comment.indexOf("@", ixForce + 6);
            if (terminator == -1) {
                throw new Exception([
                    'missing terminator for @FORCE directive.',
                    'paths list must be terminated with a @ sign.',
                    'notes:',
                    ' - usage: @FORCE [<path> [<path> [<path>]]] @',
                    ' - you may use multiple-lines',
                    ' - @ sign can be the opener of another directive after @FORCE',
                    '   when @FORCE is last - just add a @ after the paths list',
                ].join('\n'));
            }

            def forced = [
                comment.substring(ixForce + 6, terminator)
                    .split(/ +/),
            ]
            .flatten()
            .collect({ s -> s.trim() })
            .findAll({ s -> s.length() > 0 });

            this.forcedPaths = forced.size() ? forced : ['@all'];
        }
    }

    String formatName() {
        return this.authorName == this.commitrerName
            ? this.commitrerName
            : "${this.commirterName} (for ${this.authorName})";
    }

    String formatDates() {
        return this.authorDate == this.commitrerDate
            ? this.commitrerDate
            : "Accepted at ${this.committerDate} (from ${this.authorDate})";
    }

    String toString() {
        return To.string([
            sha: this.sha,
            shortSha: this.shortSha,
            authorName: this.authorName,
            authorEmail: this.authorEmail,
            authorDate: this.authorDate,
            committerName: this.committerName,
            committerEmail: this.committerEmail,
            committerDate: this.committerDate,
            comment: this.comment,
            forcedPaths: this.forcedPaths,
            skipSanity: this.skipSanity,
            skipSmokeTest: this.skipSmokeTest,
            verboseStages: this.verboseStages,
        ]);
    }
}
