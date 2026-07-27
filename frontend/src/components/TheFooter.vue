<template>
    <footer class="app-footer">
        <div class="footer__glow" />
        <v-container class="py-12" style="max-width: 1340px">
            <v-row class="gy-8">
                <v-col cols="12" md="4">
                    <div class="d-flex align-center mb-4">
                        <span class="footer__mark">
                            <v-icon icon="mdi-shield-lock" size="20" />
                        </span>
                        <span class="footer__brand">App Template</span>
                    </div>
                    <p class="footer__text">
                        Plantilla base de frontend. Personaliza el contenido,
                        los estilos y la lógica de negocio para tu próximo
                        proyecto.
                    </p>
                    <div class="d-flex align-center gap-2 mt-4">
                        <a class="footer__social" href="#" aria-label="GitHub">
                            <v-icon icon="mdi-github" size="18" />
                        </a>
                        <a class="footer__social" href="#" aria-label="LinkedIn">
                            <v-icon icon="mdi-linkedin" size="18" />
                        </a>
                        <a class="footer__social" href="#" aria-label="Email">
                            <v-icon icon="mdi-email" size="18" />
                        </a>
                    </div>
                </v-col>

                <v-col cols="6" md="2">
                    <h4 class="footer__title">Plataforma</h4>
                    <ul class="footer__list">
                        <li><RouterLink to="/">Bases de datos</RouterLink></li>
                        <li><RouterLink to="/department">Departamentos</RouterLink></li>
                        <li><RouterLink to="/zone">Zonas</RouterLink></li>
                        <li><RouterLink to="/test">Test</RouterLink></li>
                    </ul>
                </v-col>

                <v-col cols="6" md="3">
                    <h4 class="footer__title">Recursos</h4>
                    <ul class="footer__list">
                        <li><a href="#">Documentación</a></li>
                        <li><a href="#">Soporte</a></li>
                        <li><a href="#">Estado del servicio</a></li>
                    </ul>
                </v-col>

                <v-col cols="12" md="3">
                    <h4 class="footer__title">Contacto</h4>
                    <ul class="footer__list">
                        <li class="d-flex align-center">
                            <v-icon icon="mdi-phone" size="16" class="me-2" />
                            <a href="tel:+50300000000">+503 0000 0000</a>
                        </li>
                        <li class="d-flex align-center">
                            <v-icon icon="mdi-email" size="16" class="me-2" />
                            <a href="mailto:contacto@app.local">contacto@app.local</a>
                        </li>
                        <li class="d-flex align-center">
                            <v-icon icon="mdi-map-marker" size="16" class="me-2" />
                            <span>San Salvador, SV</span>
                        </li>
                    </ul>
                </v-col>
            </v-row>

            <hr class="divider-gradient my-8" />

            <div class="d-flex flex-wrap align-center justify-space-between footer__bottom">
                <span class="footer__copy">
                    &copy; {{ year }} App Template. Todos los derechos reservados.
                </span>
                <div class="d-flex gap-4">
                    <a class="footer__small" href="#">Privacidad</a>
                    <a class="footer__small" href="#">Términos</a>
                    <a class="footer__small" href="#">Seguridad</a>
                </div>
            </div>
        </v-container>
    </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.app-footer {
    position: relative;
    margin-top: $spacing-20;
    background: $background-soft;
    border-top: 1px solid $border;
    color: $text-secondary;
    overflow: hidden;
    isolation: isolate;
}

.footer__glow {
    position: absolute;
    inset: -10% -10% auto -10%;
    height: 280px;
    background: radial-gradient(60% 100% at 50% 0%, rgba(0, 212, 255, 0.15), transparent 70%);
    pointer-events: none;
    z-index: -1;
}

.footer__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: $radius-md;
    background: $accent-gradient;
    color: $text-on-accent;
    box-shadow: $shadow-glow;
    margin-right: $spacing-3;
}

.footer__brand {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    letter-spacing: -0.01em;
}

.footer__text {
    color: $text-muted;
    max-width: 36ch;
    line-height: $line-height-relaxed;
    font-size: $font-size-sm;
}

.footer__title {
    font-size: $font-size-xs;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: $primary;
    margin-bottom: $spacing-4;
    font-weight: $font-weight-semibold;
}

.footer__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;

    a {
        color: $text-muted;
        text-decoration: none;
        font-size: $font-size-sm;
        transition: color $transition-fast;

        &:hover { color: $primary; }
    }

    span { color: $text-muted; font-size: $font-size-sm; }
}

.footer__social {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $border;
    border-radius: $radius-md;
    color: $text-muted;
    background: $surface;
    transition: color $transition-fast, border-color $transition-fast, background $transition-fast, transform $transition-fast;

    &:hover {
        color: $primary;
        border-color: rgba(0, 212, 255, 0.4);
        background: $primary-soft;
        transform: translateY(-2px);
    }
}

.footer__copy,
.footer__small {
    color: $text-faded;
    font-size: $font-size-xs;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover { color: $primary; }
}
</style>
