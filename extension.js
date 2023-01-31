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
		replaceAllEditor(/\"[.\/]*?(common\/.*?)\"/, '\"{{ asset(\'$1\') }}\"');
	});

	let replacePathToRoute = vscode.commands.registerCommand('repcase.pathToRoute', function(){
		replaceRoute();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(replaceCommonToAsset);
	context.subscriptions.push(replacePathToRoute);
}

/**
 * 指定された又はアクティブなエディタの文字を正規表現で置き換えます。
 * @param {RegExp} pattern 置換対象を正規表現で指定します。
 * @param {string} replacement patternに一致したパターンがこの文字列に置換されます。
 * @param editor 置換対象のvscode editorオブジェクトを指定します。
 */
function replaceAllEditor(pattern, replacement, editor = null){
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

function replaceRoute(editor = null){
	if(editor == null){
		editor = vscode.window.activeTextEditor;
	}

	if(editor) {
		const document = editor.document;
		var text = document.getText();
		var matches = Array.from(text.matchAll(/<a[\s\S]*?>/g));
		var arrayMatches = JSON.parse(JSON.stringify(matches));

		var currentUrls = Array();
		var debug = Array();

		var regFromMiddleBracket = new RegExp(/^\{/) // { で始まる

		/**
		 * href内のURLを取得
		 */
		arrayMatches.forEach(function(value, index){
			var href = value[0].match(/href="(.*?)"/);

			if(href != null){
				var currentUrl = href[1];
				debug.push(currentUrl);
				if(currentUrl != '#' && currentUrl.indexOf(/http.*/)!==0 && currentUrl.indexOf(/\/\/.*/)!==0 && !regFromMiddleBracket.test(currentUrl)){
					currentUrls.push(currentUrl);
				}
			}
		});

		// 重複削除
		currentUrls = Array.from(new Set(currentUrls));
		vscode.window.showInformationMessage(JSON.stringify(debug));

		/**
		 * buddies {before: '置換前', after: '置換後}
		 */
		var buddies = Array();

		currentUrls.forEach(function(url, index){
			var paths = url.split('/');
			var trimmedPath = Array();
			paths.forEach(function(path, pathIndex){

				// 空でも、相対指定でもない
				var regFromDots = new RegExp(/^\.+/) // n個の.から始まる
				if(path != "" && !regFromDots.test(path)){
								// debug.push(path);
					trimmedPath.push(path);
				}
			});
			/**
			 * パスをroute記法に変換
			 */
			var tail = trimmedPath.pop();
			var regHtmlFile = new RegExp(/\.html$/) // .html で終わる
			if(regHtmlFile.test(tail)){
				var tailPaths = tail.split('.');
				// htmlを削除して返す
				tailPaths.pop();
				trimmedPath.push(tailPaths[0]);
			}else{
				// スラ止めの場合は indexを付与
				debug.push(tail);
				trimmedPath.push(tail);
				trimmedPath.push('index');
			}

			var route = trimmedPath.join('.');
			route = '{{route(\''+route+'\')}}';
			buddies.push({before: url, after: route});
		});


		// 置換
		var text = document.getText();

		const range = new vscode.Range(0, 0, editor.document.lineCount + 1, 0);
		buddies.forEach(function(value, index){
			text = text.replaceAll(value.before, value.after);
		});

		editor.edit(editBuilder => {
			editBuilder.replace(range, text);
		});

		// vscode.window.showInformationMessage(JSON.stringify(buddies));
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
