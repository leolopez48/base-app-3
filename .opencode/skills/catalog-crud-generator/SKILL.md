---
name: catalog-crud-generator
description: Catálogos CRUD, migrations, seeders, modelos, controllers, rutas, Pinia stores, composables y Vue views. Use when asked to generate a standalone or related catalog from zero in this Laravel + Vue project. Requires schema discovery and explicit confirmation before creating any missing table.
---

# Catalog CRUD Generator

Genera catálogos CRUD completos para este proyecto Laravel + Vue. Aplica tanto a catálogos autónomos como a catálogos relacionados mediante claves foráneas.

## Regla Principal

Nunca crees una tabla sin verificar primero que la base y el esquema esperado sean correctos.

Antes de escribir una migration:

1. Inspecciona las migrations, modelos, seeders y configuración de base de datos existentes.
2. Ejecuta `php artisan migrate:status` cuando el entorno y la conexión estén disponibles. No muestres credenciales de `.env`.
3. Determina si la tabla ya existe en las migrations y, cuando sea posible, en la base activa.
4. Si la tabla no existe, el esquema es ambiguo o existe una discrepancia, presenta el esquema propuesto y pregunta al usuario si está correcto.
5. Espera una confirmación explícita antes de crear o modificar tablas.

La confirmación debe mostrar como mínimo:

| Dato | Valor propuesto |
|---|---|
| Catálogo | Nombre singular y plural |
| Modelo | Clase PHP |
| Tabla | Nombre exacto |
| Llave primaria | Tipo y estrategia de incremento |
| Columnas | Nombre, tipo, longitud, nullable y default |
| Relaciones | Tabla/modelo padre, FK y columna referenciada |
| Eliminación de relación | restrict, cascade, set null o sin acción explícita |
| Soft deletes | sí/no |
| Timestamps | sí/no |
| Seeder | fuente o datos esperados |
| API | endpoint resource propuesto |
| Frontend | ruta, etiqueta y campos de tabla/formulario |

Pregunta sugerida:

> No encontré la tabla `<tabla>`. Antes de crearla, confirma si este esquema es correcto: `<resumen>`. ¿Procedo con la migration y el catálogo completo?

Si la tabla y su esquema ya existen de forma inequívoca, no vuelvas a pedir confirmación: reutiliza la base existente y genera únicamente las capas faltantes.

Si no es posible comprobar la base activa, informa el motivo y pregunta si se debe continuar tomando las migrations como fuente de verdad.

### Estado De Una Migration Existente

Cuando encuentres una migration del catálogo, determina su estado antes de editarla:

1. Si existe y está pendiente, puedes completarla después de confirmar el esquema.
2. Si ya fue ejecutada en una base que debe conservarse, no la modifiques; crea una migration nueva de alteración.
3. Si el estado no puede verificarse, pregunta. Usa una migration de alteración como opción conservadora.
4. Si el usuario confirma que aún no fue ejecutada y la ejecutará después, trátala como pendiente.
5. Nunca reescribas silenciosamente una migration aplicada.

## Descubrimiento Obligatorio

Antes de implementar, inspecciona:

- `backend/database/migrations/`
- `backend/app/Models/`
- `backend/app/Http/Controllers/`
- `backend/database/seeders/`
- `backend/routes/api.php`
- `frontend/src/services/`
- `frontend/src/stores/`
- `frontend/src/composables/`
- `frontend/src/views/`
- `frontend/src/router/index.js`
- El componente de navegación que expone los catálogos

Detecta y conserva las convenciones reales del repositorio:

- Laravel y PHP usados por el proyecto.
- Nombres de tablas singulares o plurales.
- Uso de `SoftDeletes`, timestamps y `$fillable`.
- Paginación, búsqueda y ordenamiento de los modelos.
- Uso del helper `Encrypt` para IDs de API.
- Patrón `Route::resource`.
- Vue Composition API y `<script setup>`.
- Pinia setup stores con `ref`.
- Vuelidate, servicios Axios y componentes base existentes.
- Estilo visual actual y scoped styles de las views.

No normalices nombres ni reestructures capas existentes sin que el usuario lo pida. Sigue el patrón del repositorio aunque difiera de las convenciones por defecto de Laravel.

## Clasificación Del Catálogo

Clasifica por el esquema real, no por el nombre dado en la solicitud.

### Catálogo Autónomo

No tiene una FK obligatoria hacia otro catálogo.

Ejemplo estructural actual: `Department`.

Genera:

- Migration si fue confirmada y falta.
- Modelo con búsqueda y conteo paginado.
- Controller resource.
- Seeder si se proporcionan datos o el usuario confirma la fuente.
- Ruta API.
- Servicio Axios.
- Store Pinia de estado puro.
- Composable con toda la lógica.
- View con template, `<script setup>` y scoped CSS.
- Ruta frontend y acceso en navegación.
- Pruebas backend y frontend del contrato del catálogo.

### Catálogo Relacionado

Tiene `belongsTo` hacia un catálogo padre y el padre normalmente tiene `hasMany`.

Ejemplo estructural actual: `Municipality` pertenece a `Department`.

Además de las capas anteriores, genera:

- FK con tipo compatible con la PK padre.
- `belongsTo` en el modelo hijo.
- `hasMany` en el modelo padre.
- Búsqueda por nombre del hijo y campo visible del padre.
- Alias explícito del campo visible del padre en el `select` del listado. No asumas que un `join` añade automáticamente columnas no seleccionadas.
- Estado para las opciones del padre en el store hijo.
- Función para cargar opciones en el composable hijo.
- `BaseSelect` o componente existente equivalente en el formulario.
- Columna legible del padre en la tabla, no solo la FK.
- Orden correcto de seeders: padre antes que hijo.
- Pruebas de FK, relaciones, alias legible, IDs cifrados y select padre.

## Compatibilidad De IDs Relacionados

Este proyecto puede cifrar los IDs que devuelve una API. Para relaciones, verifica siempre el flujo completo del ID:

1. El endpoint de opciones del padre devuelve ID plano o cifrado.
2. El select almacena ese mismo formato.
3. El controller hijo acepta o descifra el formato antes de asignarlo a la FK entera.
4. El update conserva el ID cifrado del registro hijo cuando el patrón `Encrypt` está activo.

No envíes un ID cifrado directamente a una columna FK entera. Resuelve una de estas estrategias y mantenla consistente:

- Endpoint de opciones con IDs planos, protegido adecuadamente.
- Descifrado explícito de la FK en `store` y `update`.
- Identificador público separado de la PK interna.

Si el patrón existente no deja clara la estrategia, pregunta antes de implementar el formulario relacionado.

Cuando el proyecto use `Encrypt`, el protocolo recomendado para un catálogo hijo es:

1. El endpoint del padre devuelve su `id` cifrado.
2. El listado del hijo cifra tanto `id` como la FK relacionada.
3. El select conserva y devuelve la FK cifrada como string.
4. `store` y `update` descifran la FK antes de validar `exists` y guardarla.
5. El ID del hijo viaja en la URL cifrado y el controller lo descifra con `findOrFail`.

Ejemplo conceptual:

```text
ParentController.index: id interno -> id cifrado
ChildController.index: id y parent_id internos -> valores cifrados
Frontend select: parent_id cifrado
ChildController.store/update: decrypt(parent_id) -> FK entera validada
```

## Contrato Backend

### Migration

Créala solo después de pasar la regla principal.

- Usa una PK incremental entera salvo que el usuario confirme otra estrategia.
- Define tipos, nullability y defaults explícitos.
- Añade índices para FKs y campos de búsqueda cuando corresponda.
- Usa `softDeletes()` y `timestamps()` únicamente según el esquema confirmado.
- El `down()` debe eliminar exactamente la tabla creada.
- Si la migration ya fue aplicada, usa una migration de alteración; no edites el historial ejecutado.
- No ejecutes `migrate`, rollback, fresh ni seed contra una base sin permiso explícito.

### Modelo

- Declara `$table` cuando la convención existente lo requiera.
- Usa `HasFactory` y `SoftDeletes` según el esquema.
- Define `$fillable` y `$hidden` siguiendo el proyecto.
- Añade relaciones Eloquent en ambos lados cuando corresponda.
- Implementa el patrón actual de listado/búsqueda/conteo.
- Agrupa condiciones `orWhere` para no escapar restricciones de soft delete o joins.
- Selecciona aliases legibles de relaciones para el frontend.
- Valida que `sortBy` solo use columnas permitidas antes de interpolarlo en `orderBy` si el controller recibe ese valor del cliente.

### Controller

Sigue el patrón del controller de catálogo existente más cercano.

- `index`: paginación, búsqueda, orden, total e IDs en el formato esperado.
- Proporciona defaults seguros para `page` e `itemsPerPage`; no calcules offsets con valores nulos.
- Soporta el formato actual de Vuetify `sortBy: [{ key, order }]` y, si el proyecto aún lo usa, su formato anterior.
- Valida `sortBy` contra una lista blanca de columnas y normaliza `order` a `asc` o `desc`.
- `store`: validación, normalización y creación.
- `show`: implementa si el patrón del proyecto lo usa; de lo contrario conserva el contrato existente.
- `update`: descifra IDs cuando corresponda, usa `findOrFail`, valida y actualiza.
- `destroy`: descifra el ID cuando corresponda, usa `findOrFail` y aplica soft delete.
- Devuelve mensajes y estructura JSON consistentes con los demás catálogos.
- No asignes `deleted_at` directamente desde el request salvo que el comportamiento del proyecto lo exija explícitamente.

### Seeder

- Resuelve relaciones por una clave estable del padre, no por IDs mágicos cuando sea posible.
- Inserta timestamps si usa `insert()` y la tabla los requiere.
- Evita duplicados cuando el seeder pueda ejecutarse más de una vez; usa `upsert`, `updateOrCreate` o limpieza controlada según la convención confirmada.
- Si el modelo usa soft deletes, define qué ocurre al resembrar una coincidencia eliminada. Para catálogos, prefiere restaurarla mediante `withTrashed()` en lugar de crear un duplicado.
- Registra el seeder hijo después del padre en `DatabaseSeeder`.
- Si no hay datos o fuente confirmada, pregunta; no inventes catálogos oficiales.

### Rutas

- Importa el controller en `backend/routes/api.php`.
- Prefiere `Route::apiResource` para APIs de SPA porque no genera las rutas `create` y `edit`. Conserva `Route::resource` si es una convención deliberada del proyecto.
- Respeta middleware y nombres de endpoints actuales.

## Contrato Frontend

Genera cuatro capas y respeta estrictamente sus responsabilidades.

### Service: `<entity>Api.js`

- Solo configura el cliente Axios para el endpoint del catálogo.
- Reutiliza interceptores o configuración existente cuando aplique.
- No contiene estado ni lógica de UI.

### Store: `<entity>.js`

Solo almacena variables con `ref` o `reactive`.

Incluye según necesidad:

- `search`
- `dialog`
- `dialogDelete`
- `headers`
- `records`
- `editedIndex`
- `total`
- `options`
- `editedItem`
- `defaultItem`
- `loading`
- `debounce`
- Listas relacionadas como `departments`, `categories` o equivalentes

No coloques acciones, API calls, watchers, computed ni validaciones en el store.

Cuando los IDs se cifren, incluye `id` dentro de `editedItem` aunque no sea un campo editable. Esto evita perder el identificador al transformar el formulario o recargar la tabla.

### Composable: `use<Entity>.js`

Contiene toda la lógica y expone los refs del store con `storeToRefs`.

Incluye según necesidad:

- Reglas y estado de Vuelidate.
- `formTitle` y otros computed derivados.
- Watchers de búsqueda y diálogos.
- `initialize`.
- `getDataFromApi` con debounce.
- Carga de catálogos padre para selects.
- `addRecord`, `editItem`, `close`, `save`.
- `deleteItem`, `closeDelete`, `deleteItemConfirm`.
- Todas las llamadas a services/API.
- Mensajes mediante `useAlert`.

El composable debe retornar únicamente lo necesario para la view.

Cuida las operaciones asíncronas:

- Las funciones que la view espera deben devolver una Promise real.
- No marques como finalizada la carga antes de que termine un `setTimeout` de debounce.
- Cancela el timeout anterior antes de iniciar una nueva búsqueda.
- Restaura `loading` en errores.
- Conserva el ID del registro editado/eliminado aunque el formulario solo tenga campos editables.
- Conserva las opciones actuales de paginación y orden para recargar la misma página después de guardar o eliminar.
- Separa una función `fetchRecords` inmediata y awaitable de `getDataFromApi`, que aplica el debounce para eventos de tabla o búsqueda.
- Para catálogos relacionados, `initialize` puede usar `Promise.all` para cargar registros y opciones padre en paralelo cuando ambas operaciones son independientes.

Patrón recomendado:

```js
const fetchRecords = async (tableOptions = options.value) => {
    // Guarda options, activa loading, espera API y restaura loading en finally.
};

const getDataFromApi = (tableOptions) => {
    clearTimeout(debounce.value);
    debounce.value = setTimeout(
        () => fetchRecords(tableOptions),
        SEARCH_DEBOUNCE_MS,
    );
};
```

### View: `<Entity>View.vue`

Contiene únicamente:

- Template.
- `<script setup>` que importa el composable y componentes visuales.
- `onMounted` para iniciar cargas explícitas.
- Scoped CSS de la vista.

No contiene reglas de negocio, Axios, acceso directo al store, validaciones declaradas localmente ni transformación de datos compleja.

La view debe incluir:

- Encabezado y descripción del catálogo.
- Búsqueda.
- Tabla server-side.
- Acciones crear, editar y eliminar.
- Dialog de creación/edición.
- Confirmación de eliminación.
- Inputs basados en componentes existentes.
- Selects legibles para relaciones.
- Estados loading, vacío y error consistentes con la UI actual.

Para selects relacionados, verifica el contrato Vue completo:

- El componente base recibe `:model-value`, no solo `:value`.
- Emite `update:modelValue`.
- Acepta strings cuando los IDs están cifrados.
- Usa `item-title` para la etiqueta y `item-value` para el ID.
- No cifra ni descifra IDs dentro del componente visual.

No crees abstracciones compartidas nuevas solo para evitar unas líneas repetidas. Mantén el patrón actual salvo que el usuario pida consolidarlo.

### Integración

- Añade la ruta protegida en `frontend/src/router/index.js`.
- Añade navegación desktop y mobile donde corresponda.
- Actualiza footer u otros accesos solo si el catálogo debe ser visible allí.
- Usa nombres coherentes entre modelo, endpoint, service, store, composable, view y ruta.

## Contrato De Pruebas

Cada catálogo generado debe incluir pruebas. No consideres terminado el catálogo hasta que pasen backend, frontend y build.

### Configuración Backend

- Usa `RefreshDatabase` para aislar cada prueba.
- Configura PHPUnit con `DB_CONNECTION=sqlite` y `DB_DATABASE=:memory:` para no alterar la base local.
- Si el catálogo usa IDs cifrados, define una `APP_KEY` exclusiva de testing en `phpunit.xml`; nunca reutilices ni expongas la clave real.
- Habilita los service providers requeridos por las funciones usadas, especialmente validación y cifrado.

### Pruebas Backend Autónomas

Para un catálogo sin relaciones, cubre como mínimo:

- Validación 422 de campos requeridos.
- Creación y `assertDatabaseHas`.
- Listado con estructura JSON, total e ID cifrado.
- Búsqueda y ordenamiento.
- Exclusión de registros soft-deleted en datos y total.
- Update mediante ID cifrado.
- Destroy y `assertSoftDeleted`.
- Fallback seguro ante un campo `sortBy` no permitido.

### Pruebas Backend Relacionadas

Además del contrato autónomo, cubre:

- Columnas de la migration.
- FK real y comportamiento `restrict`, `cascade` o `set null` confirmado.
- `belongsTo` y `hasMany`.
- Rechazo 422 de una FK inexistente.
- ID del hijo y FK devueltos en el formato cifrado esperado.
- Descifrado correcto de la FK antes de persistir.
- Alias legible del padre en el listado.
- Búsqueda y sort por el campo visible del padre.
- Cambio de relación durante update.

Con SQLite, puedes inspeccionar una FK mediante:

```php
$foreignKeys = DB::select("PRAGMA foreign_key_list('child_table')");
```

### Pruebas De Seeder

Cuando exista seeder, ejecútalo al menos dos veces dentro de la misma prueba y verifica:

- No crea duplicados.
- Respeta relaciones padre-hijo.
- Mantiene el conteo esperado.
- Restaura una coincidencia soft-deleted si ese es el contrato del catálogo.
- El padre se ejecuta antes que el hijo.

Para modelos con soft deletes, el patrón probado es:

```php
Model::withTrashed()->updateOrCreate(
    $identity,
    [...$values, 'deleted_at' => null],
);
```

### Infraestructura Frontend

Usa las herramientas ya configuradas en el proyecto:

- Vitest como runner.
- Vue Test Utils para views/componentes.
- `happy-dom` como entorno DOM.
- Mocks de services y `useAlert`; no realices HTTP real en unit tests.

Mantén scripts ejecutables:

```json
{
  "test": "vitest run"
}
```

### Pruebas De Store

Para cada store comprueba:

- Estado inicial vacío y loading en `false`.
- Headers y opciones iniciales de paginación.
- `editedItem` contiene `id: null`, aunque el ID no sea editable.
- Catálogos relacionados contienen la lista de opciones padre y su FK.
- No se definieron acciones propias en el store. Ignora métodos internos de Pinia cuyos nombres empiezan con `$` o `_`.

### Pruebas De Composable

Mockea service API, catálogos padre y `useAlert`. Comprueba:

- `initialize` espera registros y opciones relacionadas.
- `loading` vuelve a `false` tanto en éxito como en error.
- El debounce cancela la búsqueda anterior.
- `editItem` conserva IDs cifrados.
- Create usa POST y solo campos editables.
- Update usa PUT, ID cifrado en la URL y payload limpio.
- Delete usa el ID cifrado correcto.
- Después de guardar o eliminar recarga las opciones actuales de tabla.
- Los errores llaman el mensaje de alerta esperado.

### Pruebas De View

Mockea el composable; la view no debe conocer la API ni el store.

Comprueba como mínimo:

- Renderiza título y estado básico.
- Ejecuta `initialize` al montar.
- El botón Agregar delega en `addRecord`.
- Editar y eliminar delegan en sus funciones cuando las filas están disponibles.
- Los catálogos relacionados pasan opciones legibles a `BaseSelect`.

### E2E

Agrega pocos escenarios E2E cuando el entorno lo permita:

1. Abrir catálogo.
2. Crear registro.
3. Buscarlo.
4. Editarlo.
5. Paginar u ordenar.
6. Eliminarlo.

No bloquees un catálogo por ausencia de E2E si el entorno externo o autenticación no están disponibles; reporta esa limitación.

### Abstracción De Pruebas

Mantén pruebas explícitas por catálogo mientras haya pocos catálogos. Considera data providers, traits o helpers compartidos solo cuando al menos tres catálogos tengan contratos realmente repetidos y estables.

## Orden De Implementación

1. Descubrir base, esquema y convenciones.
2. Clasificar el catálogo como autónomo o relacionado.
3. Presentar y confirmar el esquema si la tabla falta o es ambigua.
4. Crear o completar migration.
5. Crear modelo y relaciones.
6. Crear seeder y registrar el orden.
7. Crear controller y ruta API.
8. Crear service frontend.
9. Crear store de variables.
10. Crear composable de lógica.
11. Crear view.
12. Añadir ruta y navegación frontend.
13. Crear pruebas backend del esquema, modelo, API y seeder.
14. Crear pruebas frontend del store, composable y view.
15. Verificar backend y frontend.

## Verificación Obligatoria

Ejecuta lo que sea seguro y esté disponible:

```text
php -l <archivos PHP modificados>
php artisan route:list
php artisan test
npm test
npm run build
```

Para migrations y seeders:

- Usa `php artisan migrate:status` para inspección.
- Puedes usar `php artisan migrate --pretend` si no muta la base y el entorno lo soporta.
- Pide permiso antes de `php artisan migrate`, `migrate:fresh`, rollback o `db:seed`.
- Si se crean tests de migration, configura PHPUnit con SQLite `:memory:` para no alterar la base local.
- Prueba al menos columnas, FK, relaciones Eloquent y soft delete cuando apliquen.

Comprueba además:

- La FK usa el mismo tipo que la PK padre.
- El modelo padre e hijo tienen relaciones correctas.
- El listado relacionado devuelve el nombre del padre.
- El select envía un ID en el formato que acepta el backend.
- Crear, editar y eliminar conservan el ID cifrado o público correcto.
- El store no contiene funciones.
- La view no contiene API calls ni lógica de negocio.
- El composable expone todas las variables y funciones usadas por la view.
- No quedan imports o archivos huérfanos.
- Las pruebas del catálogo pasan de forma aislada y dentro de la suite completa.

## Entrega

Reporta:

- Esquema confirmado o esquema existente reutilizado.
- Tipo de catálogo: autónomo o relacionado.
- Archivos creados y modificados por capa.
- Endpoints y ruta frontend.
- Verificaciones ejecutadas.
- Cantidad de tests y assertions aprobadas en backend y frontend.
- Cualquier paso no ejecutado porque mutaría la base o requería credenciales.
