using System;
using System.IO;
using System.Text.RegularExpressions;
public class Program {
    public static void Main() {
        string html = File.ReadAllText("admin.html");
        var match = Regex.Match(html, @"<script>(.*?)</script>", RegexOptions.Singleline);
        if (match.Success) {
            File.WriteAllText("admin_script.js", match.Groups[1].Value);
        }
    }
}
