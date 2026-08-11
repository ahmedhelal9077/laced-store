using System;
using System.IO;

public class Program {
    public static void Main() {
        string[] lines = File.ReadAllLines("js/data.js");
        for(int i=0; i<lines.Length; i++) {
            int idx1 = lines[i].IndexOf("name: \"");
            int idx2 = lines[i].IndexOf("\", brand:");
            if(idx1 >= 0 && idx2 > idx1) {
                int start = idx1 + 7;
                string inner = lines[i].Substring(start, idx2 - start);
                inner = inner.Replace("\"", "'");
                lines[i] = lines[i].Substring(0, start) + inner + lines[i].Substring(idx2);
            }
        }
        File.WriteAllLines("js/data.js", lines, System.Text.Encoding.UTF8);
    }
}
