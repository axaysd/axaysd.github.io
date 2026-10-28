"""Create compact portfolio image derivatives without changing original assets."""
from pathlib import Path
import json
import re
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images"
LANCZOS = Image.Resampling.LANCZOS


def rgb_image(path):
    image = ImageOps.exif_transpose(Image.open(path)).convert("RGBA")
    background = Image.new("RGBA", image.size, "#ffffff")
    background.alpha_composite(image)
    return background.convert("RGB")


def webp(source, name, max_width, height=None, quality=82):
    image = rgb_image(IMAGES / source)
    if height:
        fitted = ImageOps.contain(image, (max_width, height), LANCZOS)
        background = Image.new("RGB", (max_width, height), image.getpixel((0, 0)))
        background.paste(fitted, ((max_width - fitted.width) // 2, (height - fitted.height) // 2))
        image = background
    else:
        image.thumbnail((max_width, max_width * 4), LANCZOS)
    output = IMAGES / name
    image.save(output, "WEBP", quality=quality, method=6)
    return {"source": source, "output": name, "width": image.width,
            "height": image.height, "before": (IMAGES / source).stat().st_size,
            "after": output.stat().st_size}


def font(size, bold=False):
    options = [
        Path("C:/Windows/Fonts") / ("segoeuib.ttf" if bold else "segoeui.ttf"),
        Path("/usr/share/fonts/truetype/dejavu") / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"),
    ]
    for option in options:
        if option.is_file():
            return ImageFont.truetype(str(option), size)
    raise RuntimeError("Install Segoe UI or DejaVu Sans to generate the social preview.")


def social_preview():
    scale = 2
    canvas = Image.new("RGB", (1200 * scale, 630 * scale), "#fafbfe")
    draw = ImageDraw.Draw(canvas)
    navy, blue, muted = "#1a273d", "#3159d9", "#536076"
    draw.rectangle((0, 0, 1200 * scale, 8 * scale), fill=blue)
    draw.text((72 * scale, 132 * scale), "AI PRODUCT MANAGER", font=font(22 * scale, True), fill=blue)
    draw.text((68 * scale, 197 * scale), "Akshay Danthi", font=font(70 * scale, True), fill=navy)
    draw.text((72 * scale, 309 * scale), "AI products for complex", font=font(31 * scale), fill=muted)
    draw.text((72 * scale, 354 * scale), "enterprise workflows.", font=font(31 * scale), fill=muted)
    draw.line((72 * scale, 477 * scale, 1128 * scale, 477 * scale), fill="#dde3ee", width=2 * scale)
    draw.text((72 * scale, 513 * scale), "Product strategy  /  Hands-on building  /  Evaluation", font=font(23 * scale), fill=muted)
    portrait = rgb_image(IMAGES / "my-avatar.png").resize((310 * scale, 310 * scale), LANCZOS)
    mask = Image.new("L", portrait.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, mask.width - 1, mask.height - 1), fill=255)
    canvas.paste(portrait, (822 * scale, 133 * scale), mask)
    canvas = canvas.resize((1200, 630), LANCZOS)
    output = IMAGES / "social-preview.jpg"
    canvas.save(output, "JPEG", quality=90, optimize=True, progressive=True)
    return {"output": output.name, "width": 1200, "height": 630, "after": output.stat().st_size}


def main():
    results = []
    for size in (160, 320):
        results.append(webp("my-avatar.png", f"avatar-{size}.webp", size, quality=85))
    for number in (21, 20, 19):
        results.append(webp(f"project-{number}.png", f"project-{number}-preview.webp", 720, 405))
    data = (ROOT / "js" / "projects-data.js").read_text(encoding="utf-8")
    sources = set()
    for name in re.findall(r'assets/images/([^"\s]+)', data):
        if name.endswith('.svg'):
            continue
        if name.endswith(("-thumb.webp", "-preview.webp")):
            stem = re.sub(r"-(?:thumb|preview)\.webp$", "", name)
            original = next((f"{stem}{extension}" for extension in (".png", ".jpg")
                             if (IMAGES / f"{stem}{extension}").is_file()), None)
            if not original:
                raise RuntimeError(f"Original image missing for {name}")
            sources.add(original)
        else:
            sources.add(name)
    for source in sorted(sources):
        if source in {f"project-{n}.png" for n in (21, 20, 19)}:
            continue
        source_path = IMAGES / source
        results.append(webp(source, f"{source_path.stem}-thumb.webp", 640))
    results.append(social_preview())
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
