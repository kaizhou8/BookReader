namespace BookReader.API.Models;

public class ReaderSettings
{
    public string FontFamily { get; set; } = "Microsoft YaHei";
    public int FontSize { get; set; } = 18;
    public string Theme { get; set; } = "light";
    public float LineHeight { get; set; } = 1.5f;
    public int Brightness { get; set; } = 100;
    public bool NightMode { get; set; } = false;
}
