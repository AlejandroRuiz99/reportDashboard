# 📊 Dashboard de Reportes Mensuales - Compromiso Legal

Dashboard interactivo completo para análisis mensual de ventas, tráfico web y rendimiento en redes sociales.

**Estado**: ✅ Listo para usar | **Versión**: 3.0 | **Última actualización**: Enero 2026

---

## ✨ Características Principales

### 🎯 Core (Funcionan Siempre - Sin Configuración)

- ✅ **Análisis de Ventas**: Carga CSV de WooCommerce y obtén métricas completas
- ✅ **Métricas Comparativas**: Crecimiento vs mes anterior automático
- ✅ **Análisis por Colaborador**: Performance de María José y Margareth via UTM
- ✅ **Análisis de TikTok**: Carga CSV de TikTok Analytics y correlaciona con ventas
- ✅ **Gráficos Interactivos**: Visualización clara de ventas, tráfico y tendencias
- ✅ **Insights Automáticos**: Recomendaciones inteligentes basadas en tus datos
- ✅ **Exportación**: PDF (via print) y Excel/CSV con un clic
- ✅ **100% Privado**: Todo se procesa en tu navegador, sin enviar datos a servidores

### 🔌 Integraciones Opcionales (Requieren Configuración)

- ⚙️ **Google Analytics 4**: Métricas de tráfico web traducidas a lenguaje simple
- ⚙️ **Beacons.co**: Estadísticas de tus enlaces

Ver [`GUIA_API_KEYS.md`](./GUIA_API_KEYS.md) para configurar estas integraciones.

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar Servidor

```bash
npm run dev
```

### 3. Usar el Dashboard

1. Abre http://localhost:3000
2. Arrastra tu **CSV de ventas** (export de WooCommerce)
3. 🎉 ¡Listo! Verás:
   - Métricas de ventas con crecimiento
   - Insights automáticos
   - Análisis por colaborador
   - Gráficos y tablas
4. (Opcional) Arrastra **CSV de TikTok** para análisis de videos
5. Usa el botón **"📥 Exportar"** para guardar el reporte

---

## 📊 ¿Qué Métricas Obtienes?

### De Ventas (CSV):
- 💰 Revenue total + crecimiento mes anterior
- 📋 Total de consultas + crecimiento
- 👥 Performance por colaborador (Margareth, María José)
- 📈 Ventas diarias (gráfico)
- 🎯 Fuentes de tráfico (UTM, orgánico, directo)
- 📱 Dispositivos más usados
- 🗺️ Top provincias
- 💳 Métodos de pago
- 🆕 Clientes nuevos vs recurrentes

### De TikTok (CSV):
- 📹 Top videos correlacionados con ventas
- 💰 Revenue estimado por video
- 📊 Score de efectividad
- 🎯 Videos que generaron más consultas
- 💡 Insights: "Video del 4/01 generó 8 consultas (€552)"

### Insights Automáticos:
- 🚀 "¡Crecimiento excepcional! Las ventas subieron un 23.5%"
- ⭐ "Margareth es la colaboradora más efectiva con 45.2% de las ventas"
- 📱 "78% de las ventas vienen de móvil - web optimizada"
- 🆕 "15 clientes nuevos vs 5 recurrentes - Buen alcance"

---

## 📁 CSVs Necesarios

### CSV de Ventas (WooCommerce) ✅ Obligatorio

**Dónde obtenerlo**:
- WooCommerce → Pedidos → Exportar

**Columnas que usa**:
- `order_date`, `order_total`, `Product Item 1 Name`
- `meta:_wc_order_attribution_utm_source` (colaboradores: "Margareth", "MariaJose")
- `meta:_wc_order_attribution_source_type` ("utm", "organic", "typein")
- `meta:_wc_order_attribution_device_type` ("Mobile", "Desktop")
- `shipping_state`, `payment_method_title`, `customer_email`

**Ejemplo incluido**: `order_export_2026-01-28-01-01-56.csv`

### CSV de TikTok (TikTok Analytics) 📱 Opcional

**Dónde obtenerlo**:
- Exporta desde tu herramienta de TikTok Analytics

**Formato esperado**:
```csv
Ranking,Título,Fecha,Vistas,Likes,Comentarios,Compartidos,Score,URL
1,Descripción del video...,04/01/26,105200,1094,895,245,16406,https://...
```

**Ejemplo incluido**: `tiktok-analytics-1769613847909.csv`

---

## 🔧 Configuración Avanzada (Opcional)

### Google Analytics 4 y Beacons.co

Si quieres datos reales de tráfico web y enlaces:

1. Copia el template de configuración:
   ```bash
   cp .env.example .env.local
   ```

2. Sigue la guía paso a paso:
   ```bash
   # Abre en tu editor
   GUIA_API_KEYS.md
   ```

3. Completa tu `.env.local` con las API keys

4. Reinicia el servidor:
   ```bash
   npm run dev
   ```

**Tiempo estimado**:
- Google Analytics 4: 15-20 minutos
- Beacons.co: 5-10 minutos (si tienen API)

**Nota**: El dashboard funciona perfectamente sin esto. Mostrará datos mock hasta que lo configures.

---

## 📊 Ejemplo de Uso Completo

```bash
# 1. Instalar
npm install

# 2. Iniciar
npm run dev

# 3. En el navegador (http://localhost:3000):
- Arrastra: order_export_2026-01-28-01-01-56.csv
- Ve el dashboard completo con métricas
- Scroll hasta "Análisis de TikTok"
- Arrastra: tiktok-analytics-1769613847909.csv
- Ve correlación de videos con ventas
- Clic en "📥 Exportar" → "Exportar PDF"
- Guarda como PDF para tu cliente
```

---

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v3
- **Gráficos**: Recharts
- **Parseo CSV**: Papa Parse
- **Fechas**: date-fns
- **APIs**: Google Analytics Data API, Beacons API (opcionales)

---

## 📂 Estructura del Proyecto

```
reportDashboard/
├── src/
│   ├── app/                        # Next.js App Router
│   ├── components/
│   │   ├── Dashboard/              # Dashboard principal
│   │   ├── Charts/                 # Gráficos
│   │   ├── Upload/                 # Carga de CSV
│   │   ├── TikTok/                 # Análisis TikTok
│   │   └── Analytics/              # GA4 y Beacons
│   ├── services/
│   │   ├── csvParser.ts            # Parser CSV ventas
│   │   ├── tiktokCsvParser.ts      # Parser CSV TikTok
│   │   ├── analyticsService.ts     # Cálculo métricas
│   │   ├── comparisonService.ts    # Comparación mes anterior
│   │   ├── correlationService.ts   # Correlación TikTok-Ventas
│   │   ├── googleAnalyticsService.ts # GA4
│   │   ├── beaconsService.ts       # Beacons
│   │   └── exportService.ts        # Exportación
│   └── types/                      # TypeScript interfaces
├── .env.example                    # Template configuración
├── .gitignore                      # Protección credenciales
├── GUIA_API_KEYS.md               # Guía configuración APIs
├── PLAN.md                         # Plan original
├── ITERACION2_COMPLETADA.md       # Resumen Iteración 2
├── ITERACION3_COMPLETADA.md       # Resumen Iteración 3
└── README.md                       # Este archivo
```

---

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| [`GUIA_API_KEYS.md`](./GUIA_API_KEYS.md) | Guía paso a paso para configurar Google Analytics 4 y Beacons |
| [`PLAN.md`](./PLAN.md) | Plan original con especificaciones detalladas |
| [`ITERACION2_COMPLETADA.md`](./ITERACION2_COMPLETADA.md) | Resumen integración TikTok |
| [`ITERACION3_COMPLETADA.md`](./ITERACION3_COMPLETADA.md) | Resumen métricas comparativas e integraciones |
| [`TIKTOK_CSV_IMPLEMENTADO.md`](./TIKTOK_CSV_IMPLEMENTADO.md) | Cambio de API a CSV para TikTok |

---

## ✅ Iteraciones Completadas

### ✅ Iteración 1: MVP Core
- Carga y análisis de CSV de ventas
- Dashboard con métricas principales
- Análisis por colaborador
- Gráficos interactivos

### ✅ Iteración 2: TikTok Analytics
- Integración con TikTok (via CSV)
- Correlación videos-ventas
- Insights automáticos

### ✅ Iteración 3: Integraciones y Comparativas
- Métricas comparativas (mes anterior)
- Insights automáticos mejorados
- Estructura Google Analytics 4
- Estructura Beacons.co
- Sistema de exportación PDF/Excel
- Guía completa de API keys

---

## 🎯 Casos de Uso

| Caso de Uso | CSVs Necesarios | Tiempo | Resultado |
|-------------|-----------------|--------|-----------|
| **Reporte Básico** | Ventas | 2 min | Métricas, colaboradores, gráficos |
| **+ Análisis TikTok** | Ventas + TikTok | 3 min | Todo lo anterior + correlación videos |
| **Reporte Completo** | Ventas + TikTok + APIs | 5 min | Dashboard completo con tráfico web |
| **Análisis Rápido** | Solo Ventas | 1 min | Vista rápida, exportar PDF |

---

## 📝 Notas Importantes

- ✅ **100% Funcional sin APIs**: Todas las funciones core funcionan sin configuración
- ✅ **Privacidad**: Los datos se procesan en tu navegador, nunca se envían a servidores
- ✅ **Compatible WooCommerce**: Usa exports estándar
- ✅ **CSV Flexible**: Soporta formato multi-línea en TikTok
- ⚠️ **Seguridad**: `.env.local` nunca debe subirse a Git (ya está en `.gitignore`)
- 💡 **Datos Mock**: GA4 y Beacons muestran datos de ejemplo hasta que se configuren
- 📱 **Responsive**: Funciona en desktop y móvil

---

## 🚨 Solución de Problemas

### "No se ven estilos"
```bash
# Detener el servidor (Ctrl+C)
# Eliminar .next
rm -rf .next
# Reiniciar
npm run dev
```

### "Error al cargar CSV de TikTok"
- Verifica que tenga las columnas: Ranking, Título, Fecha, Vistas, Likes, Comentarios, Compartidos, Score, URL
- El formato puede ser multi-línea, está soportado

### "GA4 no muestra datos"
- Es normal si no has configurado las API keys
- Verás datos de ejemplo con badge "Datos de ejemplo"
- Para datos reales: Ver `GUIA_API_KEYS.md`

### Logs útiles
Abre la consola del navegador (F12) para ver:
- `✅ CSV de ventas parseado: 23 órdenes`
- `✅ CSV de TikTok parseado: 10 videos`
- `⚠️ GA4 no configurado` (si aplica)

---

## 📋 Próximas Mejoras (Futuro)

### Iteración 4: Automatización
- [ ] Scheduler para reportes automáticos
- [ ] Envío por email
- [ ] Alertas de anomalías

### Iteración 5: Análisis Avanzado
- [ ] Predicciones con Machine Learning
- [ ] Recomendaciones personalizadas
- [ ] A/B testing de campañas
- [ ] Análisis de sentimiento (comentarios TikTok)

### Iteración 6: Más Integraciones
- [ ] Instagram Analytics
- [ ] Facebook Ads
- [ ] Google Ads
- [ ] Mailchimp/Newsletter

---

## 🤝 Contribuir

¿Tienes ideas para mejorar el dashboard? 

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/MejorFeature`)
3. Commit cambios (`git commit -m 'Agregar MejorFeature'`)
4. Push (`git push origin feature/MejorFeature`)
5. Abre un Pull Request

---

## 📧 Soporte

**¿Necesitas ayuda?**

1. **Errores**: Revisa la consola del navegador (F12)
2. **APIs**: Lee `GUIA_API_KEYS.md` paso a paso
3. **Configuración**: Verifica `.env.local` y reinicia el servidor
4. **CSV**: Asegúrate de usar el formato correcto de WooCommerce

---

## 📄 Licencia

Este proyecto es privado y de uso interno para Compromiso Legal.

---

## 🎉 ¡Listo para Usar!

El dashboard está **100% funcional** sin necesidad de configurar nada adicional.

```bash
npm install
npm run dev
# Abre http://localhost:3000
# Arrastra tu CSV de ventas
# ¡Disfruta del análisis!
```

**¿Preguntas?** Revisa [`GUIA_API_KEYS.md`](./GUIA_API_KEYS.md) o la documentación en las carpetas del proyecto.

---

**Versión**: 3.0  
**Última actualización**: 28 de Enero, 2026  
**Estado**: ✅ Producción
