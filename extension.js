// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	/**
	 * Example
	 */
	let disposable = vscode.commands.registerCommand('repcase.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Repcase!');
	});

	/**
	 * Replace cases
	 */
	let replaceCommonToAsset = vscode.commands.registerCommand('repcase.commonToAsset', function(){
		replaceAll(/\"[.\/]*?(common\/.*?)\"/, '\"{{ asset(\'$1\') }}\"');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(replaceCommonToAsset);
}

/**
 * 指定された又はアクティブなエディタの文字を正規表現で置き換えます。
 * @param {RegExp} pattern 置換対象を正規表現で指定します。
 * @param {string} replacement patternに一致したパターンがこの文字列に置換されます。
 * @param editor 置換対象のvscode editorオブジェクトを指定します。
 */
function replaceAll(pattern, replacement, editor = null){
	if(editor == null){
		editor = vscode.window.activeTextEditor;
	}

	let petternGlobal = new RegExp(pattern,'g');
	if(editor) {
		const document = editor.document;
		var text = document.getText();
		var textReplaced = text.replace(petternGlobal, replacement);

		const range = new vscode.Range(0, 0, editor.document.lineCount + 1, 0);
		editor.edit(editBuilder => {
			editBuilder.replace(range, textReplaced);
		});
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
