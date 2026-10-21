# Render de prueba de «Space Harvest»: módulo de invernadero en 3D con materiales, luz y brillo (Blender, gratuito).
# Uso: python modulo_granja.py salida.png [ancho alto muestras]
import sys, math, random
import bpy
from mathutils import Vector

out = sys.argv[1] if len(sys.argv) > 1 else 'granja.png'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 720
H = int(sys.argv[3]) if len(sys.argv) > 3 else 960
SAMPLES = int(sys.argv[4]) if len(sys.argv) > 4 else 48
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.film_transparent = False
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Punchy'

def mat(name, color, metallic=0.0, rough=0.5, emit=None, emit_strength=0.0, alpha=1.0, transmission=0.0, ior=1.45, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    b.inputs['Alpha'].default_value = alpha
    if 'Transmission Weight' in b.inputs: b.inputs['Transmission Weight'].default_value = transmission
    b.inputs['IOR'].default_value = ior
    if sss and 'Subsurface Weight' in b.inputs:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.3, 0.6, 0.2)
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_strength
    return m

def put(obj, m, smooth=True):
    obj.data.materials.append(m)
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def bevel(obj, w=0.02, seg=3):
    mod = obj.modifiers.new('bevel', 'BEVEL')
    mod.width = w; mod.segments = seg
    return obj

hull = mat('casco', (0.72, 0.76, 0.82), 0.9, 0.28)
hull_dark = mat('casco_oscuro', (0.12, 0.14, 0.2), 0.85, 0.35)
hazard = mat('franja', (0.95, 0.68, 0.05), 0.2, 0.45)
glass = mat('cristal', (0.7, 1.0, 0.9), 0.0, 0.03, alpha=1.0, transmission=1.0, ior=1.45)
grow = mat('luz_cultivo', (0.8, 0.4, 1.0), 0, 0.4, emit=(0.75, 0.3, 1.0), emit_strength=14)
leaf = mat('hoja', (0.2, 0.7, 0.18), 0, 0.5, sss=0.4)
leaf2 = mat('hoja2', (0.45, 0.85, 0.2), 0, 0.5, sss=0.4)
fruit = mat('fruto', (1.0, 0.18, 0.1), 0, 0.3)
tray = mat('bandeja', (0.55, 0.6, 0.7), 0.7, 0.4)
soil = mat('sustrato', (0.12, 0.08, 0.05), 0, 0.9)
panel = mat('panel', (0.05, 0.12, 0.45), 0.6, 0.18)
win = mat('ventana', (1, 0.9, 0.6), 0, 0.3, emit=(1, 0.8, 0.4), emit_strength=8)

# --- Casco: dos secciones metálicas a los lados y un tubo de cristal en medio (el invernadero) ---
def tube(x0, x1, r, m, seg=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=x1 - x0, location=((x0 + x1) / 2, 0, 0), rotation=(0, math.pi / 2, 0))
    return bevel(put(bpy.context.object, m), 0.03)
tube(-3.4, -2.0, 1.6, hull)      # sección de popa
tube(1.4, 3.0, 1.6, hull)        # sección de proa
tube(-2.0, 1.4, 1.58, glass)     # invernadero de cristal
for x in (-3.5, 3.1):
    tube(x - 0.1, x + 0.2, 1.78, hull_dark)
for x in (-2.0, 1.4):
    tube(x - 0.09, x + 0.09, 1.7, hazard)
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1.6, location=(3.0, 0, 0), scale=(0.55, 1, 1))
put(bpy.context.object, hull)
bpy.ops.mesh.primitive_torus_add(major_radius=0.7, minor_radius=0.12, location=(3.85, 0, 0), rotation=(0, math.pi / 2, 0))
put(bpy.context.object, hull_dark)
# costillas del invernadero
for i in range(0, 8):
    bpy.ops.mesh.primitive_torus_add(major_radius=1.6, minor_radius=0.045, location=(-2.0 + i * 0.49, 0, 0), rotation=(0, math.pi / 2, 0), major_segments=64, minor_segments=8)
    put(bpy.context.object, hull_dark)
for ang in (0.5, 2.1, 3.6, 5.2):
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.035, depth=3.4, location=(-0.3, math.cos(ang) * 1.6, math.sin(ang) * 1.6), rotation=(0, math.pi / 2, 0))
    put(bpy.context.object, hull_dark)

# --- Interior: bandejas en dos filas, sustrato, plantas y luces de cultivo ---
for row, y in enumerate((-0.62, 0.62)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.3, y, -0.55), scale=(3.0, 0.5, 0.07))
    put(bpy.context.object, tray, False)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.3, y, -0.47), scale=(2.9, 0.44, 0.05))
    put(bpy.context.object, soil, False)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.3, y, 0.95), scale=(2.8, 0.09, 0.05))
    put(bpy.context.object, grow, False)
    for i in range(11):
        x = -1.65 + i * 0.29
        h = random.uniform(0.35, 0.8)
        bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=0.13, radius2=0.01, depth=h, location=(x, y, -0.45 + h / 2))
        put(bpy.context.object, leaf if i % 2 else leaf2)
        for k in range(4):
            a = k * 1.7 + i
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.12, location=(x + math.cos(a) * 0.12, y + math.sin(a) * 0.12, -0.45 + h * (0.35 + 0.18 * k)), scale=(1.5, 0.55, 0.28))
            bpy.context.object.rotation_euler = (0.3, 0, a)
            put(bpy.context.object, leaf if k % 2 else leaf2)
        if i % 3 == 0:
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.07, location=(x + 0.06, y, -0.42 + h))
            put(bpy.context.object, fruit)
bpy.ops.object.light_add(type='POINT', location=(-0.3, 0, 0.7))
pl = bpy.context.object.data
bpy.context.object.visible_camera = False; bpy.context.object.visible_transmission = False; bpy.context.object.visible_glossy = False; pl.energy = 80; pl.color = (0.8, 0.4, 1.0); pl.shadow_soft_size = 0.5

# --- Ventanas del casco ---
for x in (0.9, 1.4, 1.9):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.11, depth=0.06, location=(x, -1.58, -0.2), rotation=(math.pi / 2, 0, 0))
    put(bpy.context.object, win)

# --- Paneles solares en brazo ---
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.07, depth=2.2, location=(0.2, 0, -2.4), rotation=(0, 0, 0))
put(bpy.context.object, hull_dark)
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.2 + sx * 1.25, 0, -3.35), scale=(2.1, 1.1, 0.04))
    put(bpy.context.object, panel, False)
    for i in range(1, 6):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.2 + sx * 1.25, 0, -3.32), scale=(0.02, 1.1, 0.02))
        bpy.context.object.location.x += (i - 3) * 0.34 * 1
        put(bpy.context.object, hull, False)

# --- Planeta de fondo con atmósfera ---
bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=14, location=(58, 62, -44))
planet = put(bpy.context.object, mat('planeta', (0.1, 0.3, 0.7), 0, 0.7))
nt = planet.data.materials[0].node_tree
bs = nt.nodes['Principled BSDF']
noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 2.2; noise.inputs['Detail'].default_value = 10
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.02, 0.12, 0.45, 1); ramp.color_ramp.elements[0].position = 0.42
ramp.color_ramp.elements[1].color = (0.2, 0.55, 0.25, 1); ramp.color_ramp.elements[1].position = 0.55
nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], bs.inputs['Base Color'])
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=29, location=(58, 62, -44))
atm = bpy.context.object
am = bpy.data.materials.new('atmosfera'); am.use_nodes = True
an = am.node_tree.nodes; al = am.node_tree.links
for n in list(an): an.remove(n)
fres = an.new('ShaderNodeLayerWeight'); fres.inputs['Blend'].default_value = 0.12
em = an.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.35, 0.65, 1.0, 1); em.inputs['Strength'].default_value = 0.9
tr = an.new('ShaderNodeBsdfTransparent')
mix = an.new('ShaderNodeMixShader')
o = an.new('ShaderNodeOutputMaterial')
al.new(fres.outputs['Fresnel'], mix.inputs['Fac']); al.new(em.outputs['Emission'], mix.inputs[2]); al.new(tr.outputs['BSDF'], mix.inputs[1]); al.new(mix.outputs['Shader'], o.inputs['Surface'])
atm.data.materials.append(am)

# --- Estrellas: ruido del mundo ---
w = bpy.data.worlds.new('espacio'); sc.world = w; w.use_nodes = True
wn = w.node_tree.nodes; wl = w.node_tree.links
bg = wn['Background']; bg.inputs['Strength'].default_value = 1.0
st = wn.new('ShaderNodeTexNoise'); st.inputs['Scale'].default_value = 900; st.inputs['Detail'].default_value = 0
sr = wn.new('ShaderNodeValToRGB'); sr.color_ramp.elements[0].position = 0.80; sr.color_ramp.elements[1].position = 0.81
neb = wn.new('ShaderNodeTexNoise'); neb.inputs['Scale'].default_value = 2.0; neb.inputs['Detail'].default_value = 6
nr = wn.new('ShaderNodeValToRGB'); nr.color_ramp.elements[0].position = 0.45; nr.color_ramp.elements[0].color = (0, 0, 0, 1); nr.color_ramp.elements[1].position = 0.8; nr.color_ramp.elements[1].color = (0.10, 0.03, 0.2, 1)
add = wn.new('ShaderNodeMix'); add.data_type = 'RGBA'; add.blend_type = 'ADD'; add.inputs['Factor'].default_value = 1
wl.new(st.outputs['Fac'], sr.inputs['Fac']); wl.new(neb.outputs['Fac'], nr.inputs['Fac'])
wl.new(sr.outputs['Color'], add.inputs[6]); wl.new(nr.outputs['Color'], add.inputs[7]); wl.new(add.outputs[2], bg.inputs['Color'])

# --- Luces: sol cálido de lado y contraluz azul ---
bpy.ops.object.light_add(type='SUN', rotation=(math.radians(55), math.radians(15), math.radians(-35)))
sun = bpy.context.object.data; sun.energy = 5.5; sun.color = (1.0, 0.92, 0.8); sun.angle = math.radians(1.5)
bpy.ops.object.light_add(type='AREA', location=(-6, -3, 3))
fill = bpy.context.object; fill.data.energy = 600; fill.data.color = (0.4, 0.6, 1.0); fill.data.size = 6; fill.rotation_euler = (math.radians(70), 0, math.radians(-60))

# --- Cámara ---
bpy.ops.object.camera_add(location=(-4.5, -10.5, 4.6))
cam = bpy.context.object
cam.data.lens = 55
target = Vector((0.2, 0, -0.2))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.rotation_euler.rotate_axis('Z', math.radians(0))
sc.camera = cam
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (target - cam.location).length
cam.data.dof.aperture_fstop = 5.6

# --- Render y posproceso (brillo, viñeta y color) con Pillow/numpy ---
sc.render.filepath = out + '.crudo.png'
bpy.ops.render.render(write_still=True)
import numpy as np
from PIL import Image, ImageFilter
img = Image.open(out + '.crudo.png').convert('RGB')
a = np.asarray(img).astype(np.float32) / 255
bright = np.clip((a - 0.8) / 0.2, 0, 1) ** 1.6  # solo lo que ya brilla
glow = np.asarray(Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(W / 60))).astype(np.float32) / 255
glow2 = np.asarray(Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(W / 18))).astype(np.float32) / 255
a = 1 - (1 - a) * (1 - np.clip(glow * 0.8 + glow2 * 0.5, 0, 1))  # mezcla «screen»
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
a *= (1 - 0.38 * np.clip(d - 0.55, 0, 1) ** 1.5)[..., None]  # viñeta
a = np.clip(a * np.array([1.04, 1.0, 0.97]) + np.array([-0.005, 0, 0.012]), 0, 1)  # color: cálido en luces, frío en sombras
Image.fromarray((a * 255).astype(np.uint8)).save(out)
print('listo', out)
