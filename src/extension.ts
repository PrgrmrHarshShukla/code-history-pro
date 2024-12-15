import * as vscode from 'vscode';

function getWebviewContent(logEntries: any[]): string {
    return `
        <!DOCTYPE html>
        <html>
        <body>
            <h1>Code History Pro: Git Log</h1>
            <pre>${JSON.stringify(logEntries, null, 2)}</pre>
        </body>
        </html>
    `;
}

const logEntries: string[] = vscode.workspace.getConfiguration().get('codeHistoryPro.logEntries', []);


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "code-history-pro" is now active!');

    let disposable = vscode.commands.registerCommand('codeHistoryPro.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Code History Pro!');
		const panel = vscode.window.createWebviewPanel(
			'codeHistoryProLogView',
			'Code History Pro: Git Log',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		// Set webview HTML content
		panel.webview.html = getWebviewContent(logEntries);
    });
	
	const gitExtension = vscode.extensions.getExtension('vscode.git');

	if (gitExtension) {
		gitExtension.activate().then((api) => {
			if (api) {
				// Log repository changes
				api.onDidChangeRepository((repository: any) => {
					if (repository) {
						const logEntry = `Repository changed: ${repository.rootUri.path}`;
						console.log(logEntry);
						logEntries.push(logEntry);
						vscode.window.showInformationMessage(logEntry);
						vscode.workspace.getConfiguration().update('codeHistoryPro.logEntries', logEntries, vscode.ConfigurationTarget.Global);
					}
				});

				// Attempt to log commits
				api.repositories.forEach((repo: any) => {
					repo.state.onDidChange(() => {
						const logEntry = `Repository state changed: ${repo.rootUri.path}`;
						console.log(logEntry);
						logEntries.push(logEntry);
						vscode.window.showInformationMessage(logEntry);
						vscode.workspace.getConfiguration().update('codeHistoryPro.logEntries', logEntries, vscode.ConfigurationTarget.Global);
					});
				});
			}
		});
    } 
	else {
        console.log('Git extension not found');
    }

	

    context.subscriptions.push(disposable);
}

export function deactivate() {}