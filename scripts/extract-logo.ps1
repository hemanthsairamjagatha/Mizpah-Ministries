Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class LogoExtractor
{
    private static bool IsBg(Color c)
    {
        return (c.R >= 246 && c.G >= 246 && c.B >= 246);
    }

    public static void Extract(string srcPath, string outTransparentPath, string outWhitePath)
    {
        using (Bitmap bmp = new Bitmap(srcPath))
        {
            int minX = 71;
            int maxX = 442;
            int minY = 107;
            int maxY = 472;
            int pad = 12;

            int cropX = Math.Max(0, minX - pad);
            int cropY = Math.Max(0, minY - pad);
            int cropW = (maxX - minX + 1) + (pad * 2);
            int cropH = (maxY - minY + 1) + (pad * 2);

            bool[,] visited = new bool[cropW, cropH];
            Queue<Point> queue = new Queue<Point>();

            // Seed border pixels
            for (int x = 0; x < cropW; x++) {
                Color cTop = bmp.GetPixel(cropX + x, cropY);
                if (IsBg(cTop)) {
                    visited[x, 0] = true;
                    queue.Enqueue(new Point(x, 0));
                }
                Color cBot = bmp.GetPixel(cropX + x, cropY + cropH - 1);
                if (IsBg(cBot)) {
                    visited[x, cropH - 1] = true;
                    queue.Enqueue(new Point(x, cropH - 1));
                }
            }

            for (int y = 0; y < cropH; y++) {
                Color cLeft = bmp.GetPixel(cropX, cropY + y);
                if (IsBg(cLeft) && !visited[0, y]) {
                    visited[0, y] = true;
                    queue.Enqueue(new Point(0, y));
                }
                Color cRight = bmp.GetPixel(cropX + cropW - 1, cropY + y);
                if (IsBg(cRight) && !visited[cropW - 1, y]) {
                    visited[cropW - 1, y] = true;
                    queue.Enqueue(new Point(cropW - 1, y));
                }
            }

            int[] dx = new int[] { 0, 0, 1, -1 };
            int[] dy = new int[] { 1, -1, 0, 0 };

            while (queue.Count > 0) {
                Point pt = queue.Dequeue();
                for (int i = 0; i < 4; i++) {
                    int nx = pt.X + dx[i];
                    int ny = pt.Y + dy[i];
                    if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
                        if (!visited[nx, ny]) {
                            Color c = bmp.GetPixel(cropX + nx, cropY + ny);
                            if (IsBg(c)) {
                                visited[nx, ny] = true;
                                queue.Enqueue(new Point(nx, ny));
                            }
                        }
                    }
                }
            }

            using (Bitmap target = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
            {
                for (int x = 0; x < cropW; x++) {
                    for (int y = 0; y < cropH; y++) {
                        Color orig = bmp.GetPixel(cropX + x, cropY + y);
                        if (visited[x, y]) {
                            target.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        } else {
                            bool isEdge = false;
                            for (int i = 0; i < 4; i++) {
                                int nx = x + dx[i];
                                int ny = y + dy[i];
                                if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH && visited[nx, ny]) {
                                    isEdge = true;
                                    break;
                                }
                            }

                            if (isEdge) {
                                double brightness = (orig.R + orig.G + orig.B) / 3.0;
                                if (brightness > 220) {
                                    int alpha = Math.Max(0, Math.Min(255, (int)((255 - brightness) * 6.0)));
                                    target.SetPixel(x, y, Color.FromArgb(alpha, orig.R, orig.G, orig.B));
                                } else {
                                    target.SetPixel(x, y, Color.FromArgb(255, orig.R, orig.G, orig.B));
                                }
                            } else {
                                target.SetPixel(x, y, Color.FromArgb(255, orig.R, orig.G, orig.B));
                            }
                        }
                    }
                }

                target.Save(outTransparentPath, ImageFormat.Png);

                using (Bitmap targetWhite = new Bitmap(cropW, cropH))
                using (Graphics g = Graphics.FromImage(targetWhite))
                {
                    g.Clear(Color.White);
                    g.DrawImage(target, 0, 0);
                    targetWhite.Save(outWhitePath, ImageFormat.Png);
                }
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

$src = "C:/Users/heman/.gemini/antigravity/brain/3e6b9585-389f-48cf-9e97-dfca78fc614b/.user_uploaded/media_1793265343926_af634dae.png"
$outTrans = "d:\Churches\public\images\logo.png"
$outWhite = "d:\Churches\public\images\logo-white-bg.png"

[LogoExtractor]::Extract($src, $outTrans, $outWhite)
Write-Host "Logo successfully extracted to $outTrans and $outWhite"
