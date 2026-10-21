# Render completo de «Space Harvest»: estación con invernadero, campo solar y nave minera sobre un planeta rocoso.
# Todo procedural (sin archivos de terceros). Si existen modelos CC0 en prototipos/blender/cc0/*.glb se pueden añadir
# con `cargar_cc0()`; cada paquete que se use se apunta en docs/CREDITOS.md. Aquí solo se usa lo generado por código.
# Uso: python estacion_completa.py salida.png [ancho alto muestras]
import sys, math, random, os
import bpy
from mathutils import Vector

out = sys.argv[1] if len(sys.argv) > 1 else 'estacion.png'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 810
H = int(sys.argv[3]) if len(sys.argv) > 3 else 1080
SAMPLES = int(sys.argv[4]) if len(sys.argv) > 4 else 64
random.seed(11)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Punchy'

# ---------- materiales ----------
def principled(m):
    return m.node_tree.nodes['Principled BSDF']

def mat(name, color, metallic=0.0, rough=0.5, emit=None, emit_strength=0.0, transmission=0.0, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = principled(m)
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    if transmission: b.inputs['Transmission Weight'].default_value = transmission
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.3, 0.6, 0.2)
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_strength
    return m

def plated(name, c1, c2, metallic, rough, scale=6.0, mortar=0.012, bump=0.35):
    """Metal con placas: textura de ladrillo como líneas de unión (bump) y variación de color entre placas."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = principled(m)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    tc = nt.nodes.new('ShaderNodeTexCoord')
    br = nt.nodes.new('ShaderNodeTexBrick')
    br.inputs['Color1'].default_value = (*c1, 1)
    br.inputs['Color2'].default_value = (*c2, 1)
    br.inputs['Mortar'].default_value = (0.02, 0.02, 0.03, 1)
    br.inputs['Scale'].default_value = scale
    br.inputs['Mortar Size'].default_value = mortar
    br.inputs['Brick Width'].default_value = 1.6
    br.inputs['Row Height'].default_value = 0.6
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 40; nz.inputs['Detail'].default_value = 8
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.02
    mx = nt.nodes.new('ShaderNodeMath'); mx.operation = 'MULTIPLY_ADD'; mx.inputs[1].default_value = 0.15; mx.inputs[2].default_value = 0
    nt.links.new(tc.outputs['Object'], br.inputs['Vector'])
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nt.links.new(br.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(br.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    nt.links.new(nz.outputs['Fac'], b.inputs['Roughness'])
    nz.outputs['Fac']  # el ruido añade variación de rugosidad
    b.inputs['Roughness'].default_value = rough
    return m

def put(obj, m, smooth=True):
    obj.data.materials.append(m)
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def bevel(obj, w=0.03, seg=3):
    mod = obj.modifiers.new('bisel', 'BEVEL'); mod.width = w; mod.segments = seg
    return obj

hull = plated('casco', (0.78, 0.8, 0.85), (0.62, 0.66, 0.72), 0.85, 0.32, 5.0)
hull2 = plated('casco_b', (0.55, 0.58, 0.64), (0.42, 0.45, 0.52), 0.85, 0.38, 7.0)
dark = mat('oscuro', (0.1, 0.11, 0.16), 0.85, 0.35)
hazard = mat('franja', (0.95, 0.66, 0.05), 0.2, 0.42)
glass = mat('cristal', (0.7, 1.0, 0.92), 0.0, 0.03, transmission=1.0)
grow = mat('luz_cultivo', (0.8, 0.4, 1.0), 0, 0.4, emit=(0.75, 0.3, 1.0), emit_strength=16)
leaf = mat('hoja', (0.2, 0.72, 0.18), 0, 0.5, sss=0.4)
leaf2 = mat('hoja2', (0.5, 0.88, 0.2), 0, 0.5, sss=0.4)
fruit = mat('fruto', (1.0, 0.16, 0.08), 0, 0.3)
tray = mat('bandeja', (0.55, 0.6, 0.7), 0.7, 0.4)
soil = mat('sustrato', (0.12, 0.08, 0.05), 0, 0.9)
win = mat('ventana', (1, 0.88, 0.55), 0, 0.3, emit=(1, 0.78, 0.35), emit_strength=9)
reactor = mat('reactor', (1.0, 0.45, 0.1), 0, 0.3, emit=(1.0, 0.4, 0.08), emit_strength=7)
engine = mat('motor', (0.4, 0.75, 1.0), 0, 0.3, emit=(0.35, 0.7, 1.0), emit_strength=14)
laser = mat('laser', (1.0, 0.45, 0.1), 0, 0.3, emit=(1.0, 0.5, 0.15), emit_strength=30)

# panel solar: células (ladrillo fino) azul oscuro con reflejo metálico
solar = bpy.data.materials.new('celdas'); solar.use_nodes = True
nt = solar.node_tree; b = principled(solar)
tc = nt.nodes.new('ShaderNodeTexCoord'); br = nt.nodes.new('ShaderNodeTexBrick')
br.inputs['Color1'].default_value = (0.03, 0.09, 0.4, 1); br.inputs['Color2'].default_value = (0.04, 0.12, 0.5, 1)
br.inputs['Mortar'].default_value = (0.65, 0.7, 0.8, 1); br.inputs['Scale'].default_value = 9; br.inputs['Mortar Size'].default_value = 0.03
br.inputs['Brick Width'].default_value = 1.0; br.inputs['Row Height'].default_value = 1.0; br.inputs['Bias'].default_value = 0
nt.links.new(tc.outputs['Object'], br.inputs['Vector']); nt.links.new(br.outputs['Color'], b.inputs['Base Color'])
b.inputs['Metallic'].default_value = 0.7; b.inputs['Roughness'].default_value = 0.12

def box(loc, scale, m, rot=(0, 0, 0), bev=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, scale=scale, rotation=rot)
    o = bpy.context.object
    if bev: bevel(o, bev, 2)
    return put(o, m, False)

def cyl(loc, r, d, m, rot=(0, 0, 0), seg=48, bev=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d, location=loc, rotation=rot)
    o = bpy.context.object
    if bev: bevel(o, bev, 2)
    return put(o, m)

def sphere(loc, r, m, scale=(1, 1, 1), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc, scale=scale)
    return put(bpy.context.object, m)

def greebles(center, size, n, m, face='z'):
    """Detalles pequeños (cajas) sobre una superficie para romper la monotonía."""
    for _ in range(n):
        a, b2 = random.uniform(-size[0] / 2, size[0] / 2), random.uniform(-size[1] / 2, size[1] / 2)
        s = (random.uniform(0.05, 0.22), random.uniform(0.05, 0.22), random.uniform(0.03, 0.12))
        box((center[0] + a, center[1] + b2, center[2] + s[2] / 2), s, m, bev=0.01)

def cargar_cc0(nombre, loc=(0, 0, 0), escala=1.0, rot=(0, 0, 0)):
    """Añade un modelo CC0 (glb) de prototipos/blender/cc0/ si existe; devuelve True si se cargó."""
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cc0', nombre)
    if not os.path.exists(ruta):
        return False
    bpy.ops.import_scene.gltf(filepath=ruta)
    for o in bpy.context.selected_objects:
        if o.parent is None:
            o.location = loc; o.scale = (escala,) * 3; o.rotation_euler = rot
    return True

X = math.pi / 2
# =====================  ESTACIÓN  =====================
# núcleo central
sphere((0, 0, 0), 1.35, hull)
cyl((0, 0, 0), 1.45, 0.16, hazard, rot=(0, X, 0))
cyl((0, 0, 0), 0.5, 3.2, hull2, rot=(0, 0, 0))        # eje vertical
for z, r in ((1.55, 0.7), (-1.55, 0.7)):
    cyl((0, 0, z), r, 0.25, dark, bev=0.03)
# espina horizontal
cyl((0, 0, 0), 0.34, 11.0, hull2, rot=(0, X, 0), seg=32)
for x in range(-5, 6):
    cyl((x, 0, 0), 0.4, 0.09, dark, rot=(0, X, 0), seg=32)

# --- INVERNADERO (izquierda): tubo de cristal con bandejas y plantas ---
GX = -4.6
cyl((GX - 1.9, 0, 0), 1.0, 0.9, hull, rot=(0, X, 0), bev=0.03)
cyl((GX + 1.9, 0, 0), 1.0, 0.9, hull, rot=(0, X, 0), bev=0.03)
cyl((GX, 0, 0), 0.98, 2.9, glass, rot=(0, X, 0))
for x in (GX - 1.45, GX + 1.45):
    cyl((x, 0, 0), 1.06, 0.1, hazard, rot=(0, X, 0))
for i in range(6):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.99, minor_radius=0.03, location=(GX - 1.2 + i * 0.48, 0, 0), rotation=(0, X, 0), major_segments=48, minor_segments=8)
    put(bpy.context.object, dark)
for y in (-0.4, 0.4):
    box((GX, y, -0.36), (2.6, 0.34, 0.05), tray)
    box((GX, y, -0.3), (2.5, 0.3, 0.04), soil)
    box((GX, y, 0.62), (2.4, 0.07, 0.04), grow)
    for i in range(10):
        x = GX - 1.15 + i * 0.255
        h = random.uniform(0.3, 0.62)
        bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=0.1, radius2=0.01, depth=h, location=(x, y, -0.28 + h / 2))
        put(bpy.context.object, leaf if i % 2 else leaf2)
        for k in range(3):
            a = k * 2.0 + i
            bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=0.1, location=(x + math.cos(a) * 0.1, y + math.sin(a) * 0.1, -0.28 + h * (0.4 + 0.2 * k)), scale=(1.5, 0.55, 0.28))
            bpy.context.object.rotation_euler = (0.3, 0, a)
            put(bpy.context.object, leaf if k % 2 else leaf2)
        if i % 3 == 0:
            sphere((x + 0.05, y, -0.25 + h), 0.055, fruit, seg=12)
bpy.ops.object.light_add(type='POINT', location=(GX, 0, 0.4))
pl = bpy.context.object; pl.data.energy = 90; pl.data.color = (0.8, 0.4, 1.0); pl.data.shadow_soft_size = 0.4
pl.visible_camera = pl.visible_transmission = pl.visible_glossy = False
# depósitos de agua del invernadero
for dy in (-1.6, 1.6):
    cyl((GX + 0.4, dy, -0.7), 0.35, 1.3, hull2, rot=(0, X, 0), bev=0.03)
    cyl((GX + 0.4, dy, -0.7), 0.37, 0.12, hazard, rot=(0, X, 0))

# --- CAMPO SOLAR (derecha): mástil vertical con 6 paneles que miran al observador y al sol ---
SX = 4.6
cyl((SX, 0, 0), 0.2, 9.4, hull2, seg=24)
for sz in (-1, 1):
    for k in range(3):
        z = sz * (1.0 + k * 1.55)
        box((SX + 1.2, 0, z), (2.3, 0.07, 1.35), solar, rot=(0, 0, math.radians(-14)), bev=0.01)
        box((SX + 1.2, 0.05, z), (2.36, 0.04, 1.4), dark, rot=(0, 0, math.radians(-14)))
        box((SX + 0.05, 0, z), (0.5, 0.1, 0.12), hull2)
# baterías y reactor junto al mástil
for z in (-0.9, -0.5):
    cyl((SX - 0.8, 0, z), 0.2, 1.4, hull, rot=(0, X, 0), bev=0.02)
cyl((SX - 0.8, 0, -0.1), 0.15, 1.2, reactor, rot=(0, X, 0))

# --- ATRAQUE (arriba): nave de suministro ---
cyl((0, 0, 1.9), 0.25, 0.3, dark)
cyl((0, 0, 2.5), 0.25, 0.7, hull2, bev=0.02)
ship = (0.0, 0.0, 3.4)
sphere((0, 0, 3.4), 0.45, hull, scale=(0.9, 0.9, 1.4))
for ang in (0, 2.1, 4.2):
    box((math.cos(ang) * 0.5, math.sin(ang) * 0.5, 3.1), (0.5, 0.06, 0.28), hull2, rot=(0, 0, ang), bev=0.01)
    cyl((math.cos(ang) * 0.6, math.sin(ang) * 0.6, 2.95), 0.07, 0.1, engine)

# greebles en las cápsulas y el núcleo
greebles((0, 0, 1.38), (1.2, 1.2), 8, hull2)
greebles((0, 0, -1.4), (1.2, 1.2), 8, hull2)
# ventanas del núcleo
for a in range(8):
    ang = a * math.pi / 4
    cyl((math.cos(ang) * 1.36, math.sin(ang) * 1.36, 0.35), 0.07, 0.06, win, rot=(X, 0, ang + X / 1.0), seg=12)

# --- NAVE MINERA (abajo, con láser hacia el planeta) ---
MX, MY, MZ = -1.2, -0.6, -4.2
sphere((MX, MY, MZ), 0.55, hull, scale=(1.5, 0.8, 0.7))
box((MX - 0.2, MY, MZ + 0.5), (0.55, 0.4, 0.2), hull2, bev=0.03)
cyl((MX + 0.5, MY, MZ - 0.15), 0.12, 0.7, dark, rot=(0, X, 0))
cyl((MX, MY, MZ - 0.65), 0.08, 1.3, dark)
sphere((MX, MY, MZ - 1.3), 0.14, laser, seg=16)
cyl((MX, MY, MZ - 3.4), 0.04, 4.2, laser, seg=12)       # láser hacia la superficie
for dx in (-0.7, 0.7):
    cyl((MX + dx, MY, MZ + 0.05), 0.08, 0.14, engine, rot=(0, X, 0))
for i in range(4):
    box((MX + 1.6 + i * 0.28, MY + 0.3, MZ - 0.1), (0.24, 0.24, 0.24), hazard if i % 2 else hull2, bev=0.01)   # contenedores de mineral remolcados

# =====================  PLANETA ROCOSO  =====================
pm = bpy.data.materials.new('roca'); pm.use_nodes = True
nt = pm.node_tree; pb = principled(pm)
n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 5.0; n1.inputs['Detail'].default_value = 12
n2 = nt.nodes.new('ShaderNodeTexVoronoi'); n2.inputs['Scale'].default_value = 30
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.12, 0.04, 0.02, 1); ramp.color_ramp.elements[0].position = 0.42
ramp.color_ramp.elements[1].color = (0.85, 0.38, 0.14, 1); ramp.color_ramp.elements[1].position = 0.58
bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 1.2; bp.inputs['Distance'].default_value = 0.2
nt.links.new(n1.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], pb.inputs['Base Color'])
nt.links.new(n2.outputs['Distance'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], pb.inputs['Normal'])
pb.inputs['Roughness'].default_value = 0.85
bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=84, location=(-6, 6, -92))
put(bpy.context.object, pm)
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=85.5, location=(-6, 6, -92))
atm = bpy.context.object
am = bpy.data.materials.new('atmosfera'); am.use_nodes = True
an = am.node_tree.nodes; al = am.node_tree.links
for n in list(an): an.remove(n)
fr = an.new('ShaderNodeLayerWeight'); fr.inputs['Blend'].default_value = 0.1
em = an.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.55, 0.3, 1); em.inputs['Strength'].default_value = 1.4
tr = an.new('ShaderNodeBsdfTransparent'); mix = an.new('ShaderNodeMixShader'); o = an.new('ShaderNodeOutputMaterial')
al.new(fr.outputs['Fresnel'], mix.inputs['Fac']); al.new(em.outputs['Emission'], mix.inputs[2]); al.new(tr.outputs['BSDF'], mix.inputs[1]); al.new(mix.outputs['Shader'], o.inputs['Surface'])
atm.data.materials.append(am)

# =====================  ESPACIO, SOL Y CÁMARA  =====================
w = bpy.data.worlds.new('espacio'); sc.world = w; w.use_nodes = True
wn = w.node_tree.nodes; wl = w.node_tree.links
bg = wn['Background']; bg.inputs['Strength'].default_value = 1.0
st = wn.new('ShaderNodeTexNoise'); st.inputs['Scale'].default_value = 900; st.inputs['Detail'].default_value = 0
sr = wn.new('ShaderNodeValToRGB'); sr.color_ramp.elements[0].position = 0.8; sr.color_ramp.elements[1].position = 0.81
neb = wn.new('ShaderNodeTexNoise'); neb.inputs['Scale'].default_value = 1.8; neb.inputs['Detail'].default_value = 6
nr = wn.new('ShaderNodeValToRGB'); nr.color_ramp.elements[0].position = 0.45; nr.color_ramp.elements[0].color = (0, 0, 0, 1); nr.color_ramp.elements[1].position = 0.8; nr.color_ramp.elements[1].color = (0.16, 0.04, 0.1, 1)
add = wn.new('ShaderNodeMix'); add.data_type = 'RGBA'; add.blend_type = 'ADD'; add.inputs['Factor'].default_value = 1
wl.new(st.outputs['Fac'], sr.inputs['Fac']); wl.new(neb.outputs['Fac'], nr.inputs['Fac'])
wl.new(sr.outputs['Color'], add.inputs[6]); wl.new(nr.outputs['Color'], add.inputs[7]); wl.new(add.outputs[2], bg.inputs['Color'])

bpy.ops.object.light_add(type='SUN', rotation=(math.radians(52), math.radians(-18), math.radians(50)))
sun = bpy.context.object.data; sun.energy = 6.0; sun.color = (1.0, 0.9, 0.75); sun.angle = math.radians(1.2)
bpy.ops.object.light_add(type='AREA', location=(-8, -6, 4))
f = bpy.context.object; f.data.energy = 900; f.data.color = (0.45, 0.6, 1.0); f.data.size = 8
f.rotation_euler = (math.radians(75), 0, math.radians(-55)); f.visible_camera = False
# sol visible al fondo (arriba a la derecha) para el destello
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=3.2, location=(30, 40, 24))
sunball = put(bpy.context.object, mat('sol', (1, 0.9, 0.7), 0, 1, emit=(1, 0.85, 0.55), emit_strength=60))

bpy.ops.object.camera_add(location=(-2.5, -26, 5.5))
cam = bpy.context.object; cam.data.lens = 40
target = Vector((0.2, 0, -0.5))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
cam.data.dof.use_dof = True; cam.data.dof.focus_distance = (target - cam.location).length; cam.data.dof.aperture_fstop = 9

# =====================  RENDER Y POSPROCESO  =====================
sc.render.filepath = out + '.crudo.png'
bpy.ops.render.render(write_still=True)
import numpy as np
from PIL import Image, ImageFilter
img = Image.open(out + '.crudo.png').convert('RGB')
a = np.asarray(img).astype(np.float32) / 255
bright = np.clip((a - 0.82) / 0.18, 0, 1) ** 1.6
blur = lambda arr, r: np.asarray(Image.fromarray((arr * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255
a = 1 - (1 - a) * (1 - np.clip(blur(bright, W / 70) * 0.8 + blur(bright, W / 20) * 0.6, 0, 1))
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
a *= (1 - 0.35 * np.clip(d - 0.6, 0, 1) ** 1.5)[..., None]
a = np.clip(a * np.array([1.04, 1.0, 0.97]) + np.array([-0.005, 0, 0.012]), 0, 1)
Image.fromarray((a * 255).astype(np.uint8)).save(out)
os.remove(out + '.crudo.png')
print('listo', out)
