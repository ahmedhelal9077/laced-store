try {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    var file = fso.OpenTextFile('js/data.js', 1, false, -1);
    var text = file.ReadAll();
    file.Close();
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
        try {
            eval(lines[i]);
        } catch(e) {
            if (lines[i].indexOf('{') !== -1) {
                WScript.Echo('Error on line ' + (i+1) + ': ' + e.message);
                WScript.Echo(lines[i]);
            }
        }
    }
} catch (e) {
    WScript.Echo('Fatal: ' + e.message);
}
