# Ranking mundial (Firebase)

Decidido por Mikel (2026-10-19): Firebase, nivel gratuito (plan Spark). El código ya está en `src/ui/ranking.ts`; falta crear el proyecto y pegar su configuración.

## Pasos (una sola vez, los hace Mikel)

1. En https://console.firebase.google.com crea un proyecto (sin Google Analytics) y añade una **app web**. Copia `apiKey`, `authDomain`, `projectId` y `appId`.
2. **Authentication → Método de acceso → Anónimo**: actívalo.
3. **Firestore Database → Crear base de datos** (modo producción, región europea) y pega estas reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{uid} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['name', 'total', 'updatedAt'])
        && request.resource.data.name is string && request.resource.data.name.size() >= 3 && request.resource.data.name.size() <= 16
        && request.resource.data.total is number && request.resource.data.total >= 0;
      allow update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['name', 'total', 'updatedAt'])
        && request.resource.data.name is string && request.resource.data.name.size() >= 3 && request.resource.data.name.size() <= 16
        && request.resource.data.total is number && request.resource.data.total >= resource.data.total;
      allow delete: if false;
    }
  }
}
```
4. **Firestore → Índices**: no hace falta ninguno (la consulta ordena por un solo campo).
5. En `src/data/firebase.json` pon `"enabled": true` y pega los cuatro valores (la configuración web de Firebase no es secreta; la seguridad la dan las reglas).
6. Authentication → Configuración → Dominios autorizados: añade `mikeljka.github.io`.

## Limitaciones conocidas

- Las reglas exigen que el total solo suba, pero no impiden que alguien envíe un número falso. Más adelante se puede añadir una Cloud Function (plan de pago) o una comprobación de coherencia; por ahora es un ranking «de confianza».
- Los apodos se limitan a 3-16 letras, números y signos simples; no hay moderación automática.
- Hay que sumar el ranking a la política de privacidad y al consentimiento de la UE (tarea de la Fase 3).
