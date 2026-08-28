import math

def ellipse_path(cx, cy, rx, ry, rotation_deg):
    theta = math.radians(rotation_deg)
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)
    
    x1 = cx + rx * cos_t
    y1 = cy + rx * sin_t
    x2 = cx - rx * cos_t
    y2 = cy - rx * sin_t
    
    path = f"M {x1:.2f} {y1:.2f} A {rx} {ry} {rotation_deg} 1 1 {x2:.2f} {y2:.2f} A {rx} {ry} {rotation_deg} 1 1 {x1:.2f} {y1:.2f}"
    return path

print("Path 1:", ellipse_path(160, 160, 140, 50, 30))
print("Path 2:", ellipse_path(160, 160, 140, 50, 90))
print("Path 3:", ellipse_path(160, 160, 140, 50, 150))
