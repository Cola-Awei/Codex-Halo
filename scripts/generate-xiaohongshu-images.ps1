$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$outDir = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'docs\xiaohongshu'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$script:W = 1080
$script:H = 1440

function New-Color {
    param(
        [Parameter(Mandatory)][string]$Hex,
        [int]$Alpha = 255
    )

    $value = $Hex.TrimStart('#')
    return [System.Drawing.Color]::FromArgb(
        $Alpha,
        [Convert]::ToInt32($value.Substring(0, 2), 16),
        [Convert]::ToInt32($value.Substring(2, 2), 16),
        [Convert]::ToInt32($value.Substring(4, 2), 16)
    )
}

function New-UiFont {
    param(
        [int]$Size,
        [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular
    )

    return [System.Drawing.Font]::new('Microsoft YaHei UI', $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Text {
    param(
        [Parameter(Mandatory)]$Graphics,
        [Parameter(Mandatory)][string]$Text,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [Parameter(Mandatory)][System.Drawing.Font]$Font,
        [Parameter(Mandatory)][System.Drawing.Color]$Color,
        [System.Drawing.StringAlignment]$Align = [System.Drawing.StringAlignment]::Near,
        [System.Drawing.StringAlignment]$VAlign = [System.Drawing.StringAlignment]::Near
    )

    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = $Align
    $format.LineAlignment = $VAlign
    $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoClip
    $brush = [System.Drawing.SolidBrush]::new($Color)
    $rect = [System.Drawing.RectangleF]::new($X, $Y, $Width, $Height)
    $Graphics.DrawString($Text, $Font, $brush, $rect, $format)
    $brush.Dispose()
    $format.Dispose()
}

function New-RoundedPath {
    param(
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $Radius * 2
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function Fill-RoundRect {
    param(
        [Parameter(Mandatory)]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius,
        [Parameter(Mandatory)][System.Drawing.Color]$Fill,
        [System.Drawing.Color]$Stroke = [System.Drawing.Color]::Transparent,
        [float]$StrokeWidth = 0
    )

    $path = New-RoundedPath -X $X -Y $Y -Width $Width -Height $Height -Radius $Radius
    $brush = [System.Drawing.SolidBrush]::new($Fill)
    $Graphics.FillPath($brush, $path)
    $brush.Dispose()

    if ($StrokeWidth -gt 0) {
        $pen = [System.Drawing.Pen]::new($Stroke, $StrokeWidth)
        $Graphics.DrawPath($pen, $path)
        $pen.Dispose()
    }

    $path.Dispose()
}

function Draw-Background {
    param([Parameter(Mandatory)]$Graphics)

    $rect = [System.Drawing.Rectangle]::new(0, 0, $script:W, $script:H)
    $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        $rect,
        (New-Color '#03070d'),
        (New-Color '#071923'),
        90
    )
    $Graphics.FillRectangle($bg, $rect)
    $bg.Dispose()

    $glows = @(
        @{ X = 820; Y = 290; Radius = 520; Color = (New-Color '#159dff' 84) },
        @{ X = 230; Y = 1140; Radius = 470; Color = (New-Color '#39f1ff' 42) },
        @{ X = 940; Y = 1180; Radius = 360; Color = (New-Color '#75f5d2' 30) }
    )

    foreach ($glow in $glows) {
        $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $path.AddEllipse(
            $glow.X - $glow.Radius,
            $glow.Y - $glow.Radius,
            $glow.Radius * 2,
            $glow.Radius * 2
        )
        $brush = [System.Drawing.Drawing2D.PathGradientBrush]::new($path)
        $brush.CenterColor = $glow.Color
        $brush.SurroundColors = @((New-Color '#03070d' 0))
        $Graphics.FillPath($brush, $path)
        $brush.Dispose()
        $path.Dispose()
    }

    $gridPen = [System.Drawing.Pen]::new((New-Color '#1b4a61' 44), 1)
    for ($y = 160; $y -lt $script:H; $y += 120) {
        $Graphics.DrawLine($gridPen, 70, $y, $script:W - 70, $y)
    }
    for ($x = 100; $x -lt $script:W; $x += 140) {
        $Graphics.DrawLine($gridPen, $x, 90, $x, $script:H - 90)
    }
    $gridPen.Dispose()
}

function Draw-Brand {
    param([Parameter(Mandatory)]$Graphics)

    Draw-Text -Graphics $Graphics -Text 'Codex Halo' -X 74 -Y 72 -Width 500 -Height 64 `
        -Font (New-UiFont 42 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f4fbff') `
        -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $Graphics -Text '桌面悬浮状态光环' -X 78 -Y 126 -Width 420 -Height 38 `
        -Font (New-UiFont 22) -Color (New-Color '#8fb6c6') `
        -VAlign ([System.Drawing.StringAlignment]::Center)
}

function Draw-Halo {
    param(
        [Parameter(Mandatory)]$Graphics,
        [float]$Cx,
        [float]$Cy,
        [float]$Radius,
        [Parameter(Mandatory)][string]$Label,
        [Parameter(Mandatory)][System.Drawing.Color]$MainColor,
        [Parameter(Mandatory)][System.Drawing.Color]$SecondaryColor,
        [float]$LineWidth = 38
    )

    $box = [System.Drawing.RectangleF]::new(
        $Cx - $Radius,
        $Cy - $Radius,
        $Radius * 2,
        $Radius * 2
    )

    $glowSpecs = @(
        @{ Width = $LineWidth + 34; Alpha = 32; Color = $MainColor },
        @{ Width = $LineWidth + 18; Alpha = 55; Color = $SecondaryColor },
        @{ Width = $LineWidth + 6; Alpha = 88; Color = $MainColor }
    )

    foreach ($spec in $glowSpecs) {
        $glowColor = [System.Drawing.Color]::FromArgb($spec.Alpha, $spec.Color.R, $spec.Color.G, $spec.Color.B)
        $pen = [System.Drawing.Pen]::new($glowColor, $spec.Width)
        $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $Graphics.DrawArc($pen, $box, 130, 302)
        $pen.Dispose()
    }

    $outer = [System.Drawing.Pen]::new($SecondaryColor, $LineWidth)
    $outer.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $outer.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $Graphics.DrawArc($outer, $box, 130, 302)
    $outer.Dispose()

    $inner = [System.Drawing.Pen]::new($MainColor, [Math]::Max(10, $LineWidth * 0.58))
    $inner.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $inner.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $Graphics.DrawArc($inner, $box, 130, 302)
    $inner.Dispose()

    Draw-Text -Graphics $Graphics -Text $Label -X ($Cx - $Radius) -Y ($Cy - 48) -Width ($Radius * 2) -Height 96 `
        -Font (New-UiFont ([int]($Radius * 0.26)) ([System.Drawing.FontStyle]::Bold)) `
        -Color (New-Color '#ffffff') -Align ([System.Drawing.StringAlignment]::Center) `
        -VAlign ([System.Drawing.StringAlignment]::Center)
}

function Draw-Pill {
    param(
        [Parameter(Mandatory)]$Graphics,
        [Parameter(Mandatory)][string]$Text,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [Parameter(Mandatory)][System.Drawing.Color]$Accent
    )

    Fill-RoundRect -Graphics $Graphics -X $X -Y $Y -Width $Width -Height 62 -Radius 31 `
        -Fill (New-Color '#07131c' 215) -Stroke (New-Color '#1f5d75' 130) -StrokeWidth 1.5
    $dot = [System.Drawing.SolidBrush]::new($Accent)
    $Graphics.FillEllipse($dot, $X + 24, $Y + 22, 18, 18)
    $dot.Dispose()
    Draw-Text -Graphics $Graphics -Text $Text -X ($X + 58) -Y ($Y + 9) -Width ($Width - 70) -Height 44 `
        -Font (New-UiFont 23 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#e9fbff') `
        -VAlign ([System.Drawing.StringAlignment]::Center)
}

function Save-Card {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][scriptblock]$Paint
    )

    $bitmap = [System.Drawing.Bitmap]::new($script:W, $script:H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    Draw-Background -Graphics $graphics
    Draw-Brand -Graphics $graphics
    & $Paint $graphics

    $graphics.Dispose()
    $path = Join-Path $outDir $Name
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    return $path
}

$paths = @()

$paths += Save-Card -Name '01-cover.png' -Paint {
    param($g)
    Draw-Text -Graphics $g -Text '给 Codex 一个' -X 82 -Y 220 -Width 720 -Height 78 `
        -Font (New-UiFont 58 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f5fcff')
    Draw-Text -Graphics $g -Text '桌面状态光环' -X 82 -Y 294 -Width 780 -Height 96 `
        -Font (New-UiFont 72 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#bff5ff')
    Draw-Text -Graphics $g -Text '思考时转动，完成后变色。透明悬浮，不占任务栏。' -X 86 -Y 414 -Width 780 -Height 88 `
        -Font (New-UiFont 27) -Color (New-Color '#9ec5d2')
    Draw-Halo -Graphics $g -Cx 540 -Cy 790 -Radius 245 -Label '思考' `
        -MainColor (New-Color '#e7fbff') -SecondaryColor (New-Color '#49d9ff') -LineWidth 54
    Draw-Pill -Graphics $g -Text 'Windows 桌面悬浮小窗' -X 120 -Y 1114 -Width 360 -Accent (New-Color '#54ddff')
    Draw-Pill -Graphics $g -Text '可拖拽 / 可缩放 / 托盘常驻' -X 120 -Y 1196 -Width 470 -Accent (New-Color '#7cf7cb')
}

$paths += Save-Card -Name '02-status.png' -Paint {
    param($g)
    Draw-Text -Graphics $g -Text '两个状态就够了' -X 82 -Y 230 -Width 760 -Height 84 `
        -Font (New-UiFont 64 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f6fdff')
    Draw-Text -Graphics $g -Text 'Thinking / Done，根据 Codex 本地会话日志推断，完成后保持到下一次任务开始。' -X 86 -Y 324 -Width 820 -Height 92 `
        -Font (New-UiFont 27) -Color (New-Color '#9ec5d2')
    Fill-RoundRect -Graphics $g -X 96 -Y 490 -Width 888 -Height 350 -Radius 32 `
        -Fill (New-Color '#06111a' 200) -Stroke (New-Color '#185d82' 150) -StrokeWidth 1.5
    Draw-Halo -Graphics $g -Cx 330 -Cy 665 -Radius 118 -Label '思考' `
        -MainColor (New-Color '#e9fdff') -SecondaryColor (New-Color '#4bdcff') -LineWidth 30
    Draw-Text -Graphics $g -Text 'Thinking' -X 232 -Y 812 -Width 200 -Height 42 `
        -Font (New-UiFont 26 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#9fefff') `
        -Align ([System.Drawing.StringAlignment]::Center) -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Halo -Graphics $g -Cx 750 -Cy 665 -Radius 118 -Label '完成' `
        -MainColor (New-Color '#eafff8') -SecondaryColor (New-Color '#65f5b9') -LineWidth 30
    Draw-Text -Graphics $g -Text 'Done' -X 650 -Y 812 -Width 200 -Height 42 `
        -Font (New-UiFont 26 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#aefbd8') `
        -Align ([System.Drawing.StringAlignment]::Center) -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text '状态切换只渐变颜色，外圈不会从头重启旋转。' -X 130 -Y 930 -Width 820 -Height 54 `
        -Font (New-UiFont 30 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f1fbff') `
        -Align ([System.Drawing.StringAlignment]::Center) -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Pill -Graphics $g -Text '思考：用户消息 / 推理 / 工具调用' -X 132 -Y 1058 -Width 500 -Accent (New-Color '#54ddff')
    Draw-Pill -Graphics $g -Text '完成：final answer' -X 132 -Y 1140 -Width 330 -Accent (New-Color '#7cf7cb')
}

$paths += Save-Card -Name '03-tray.png' -Paint {
    param($g)
    Draw-Text -Graphics $g -Text '不在任务栏打扰你' -X 82 -Y 230 -Width 820 -Height 84 `
        -Font (New-UiFont 62 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f6fdff')
    Draw-Text -Graphics $g -Text '常驻系统托盘。右键可设置比例，也可以隐藏或退出。' -X 86 -Y 324 -Width 820 -Height 74 `
        -Font (New-UiFont 28) -Color (New-Color '#9ec5d2')
    Fill-RoundRect -Graphics $g -X 126 -Y 480 -Width 828 -Height 520 -Radius 34 `
        -Fill (New-Color '#f7fbff' 238) -Stroke (New-Color '#c7eaff' 120) -StrokeWidth 2
    Fill-RoundRect -Graphics $g -X 170 -Y 546 -Width 360 -Height 360 -Radius 24 `
        -Fill (New-Color '#07131c' 242) -Stroke (New-Color '#1a607f' 160) -StrokeWidth 2
    Draw-Halo -Graphics $g -Cx 350 -Cy 726 -Radius 112 -Label '完成' `
        -MainColor (New-Color '#f3ffff') -SecondaryColor (New-Color '#67f4c1') -LineWidth 28
    Fill-RoundRect -Graphics $g -X 590 -Y 548 -Width 300 -Height 386 -Radius 24 `
        -Fill (New-Color '#08141d' 245) -Stroke (New-Color '#215a75' 160) -StrokeWidth 2
    Draw-Text -Graphics $g -Text 'Codex Halo' -X 626 -Y 586 -Width 230 -Height 42 `
        -Font (New-UiFont 26 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f5fcff') `
        -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text '显示 / 隐藏' -X 626 -Y 652 -Width 220 -Height 40 `
        -Font (New-UiFont 23) -Color (New-Color '#c9edf8') -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text '比例 10 20 30' -X 626 -Y 704 -Width 230 -Height 40 `
        -Font (New-UiFont 23) -Color (New-Color '#c9edf8') -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text '比例 40 50 60' -X 626 -Y 756 -Width 230 -Height 40 `
        -Font (New-UiFont 23) -Color (New-Color '#c9edf8') -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text '退出' -X 626 -Y 828 -Width 220 -Height 40 `
        -Font (New-UiFont 23) -Color (New-Color '#c9edf8') -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Pill -Graphics $g -Text '默认比例：30' -X 150 -Y 1100 -Width 260 -Accent (New-Color '#54ddff')
    Draw-Pill -Graphics $g -Text '支持 10 / 20 / 30 / 40 / 50 / 60' -X 150 -Y 1182 -Width 520 -Accent (New-Color '#7cf7cb')
}

$paths += Save-Card -Name '04-download.png' -Paint {
    param($g)
    Draw-Text -Graphics $g -Text '已打包 exe' -X 82 -Y 230 -Width 720 -Height 84 `
        -Font (New-UiFont 66 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#f6fdff')
    Draw-Text -Graphics $g -Text '下载后直接运行：透明置顶、可拖拽、托盘常驻。' -X 86 -Y 324 -Width 820 -Height 74 `
        -Font (New-UiFont 28) -Color (New-Color '#9ec5d2')
    Draw-Halo -Graphics $g -Cx 540 -Cy 660 -Radius 175 -Label '完成' `
        -MainColor (New-Color '#f3ffff') -SecondaryColor (New-Color '#67f4c1') -LineWidth 42
    Fill-RoundRect -Graphics $g -X 102 -Y 936 -Width 876 -Height 228 -Radius 34 `
        -Fill (New-Color '#f7fbff' 238) -Stroke (New-Color '#c7eaff' 120) -StrokeWidth 2
    Draw-Text -Graphics $g -Text 'GitHub Release' -X 150 -Y 978 -Width 780 -Height 50 `
        -Font (New-UiFont 34 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#07131c') `
        -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text 'github.com/Cola-Awei/Codex-Halo/releases' -X 150 -Y 1044 -Width 780 -Height 44 `
        -Font (New-UiFont 26) -Color (New-Color '#174156') -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Text -Graphics $g -Text 'Codex-Halo.exe' -X 150 -Y 1100 -Width 780 -Height 44 `
        -Font (New-UiFont 28 ([System.Drawing.FontStyle]::Bold)) -Color (New-Color '#0d6f96') `
        -VAlign ([System.Drawing.StringAlignment]::Center)
    Draw-Pill -Graphics $g -Text '开源项目：Codex-Halo' -X 152 -Y 1240 -Width 390 -Accent (New-Color '#54ddff')
}

$paths | ForEach-Object { Write-Output $_ }

