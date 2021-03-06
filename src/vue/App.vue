<template>
    <div id="app"
         ref="app"
         :class="{[theme]: 1, 'disable-transitions': disableTransitions}"
         @contextmenu.prevent="">

        <!-- Background shapes -->
        <div class="app-background">
            <svg class="left"
                 viewBox="0 0 500 500"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M0,0V500H124.914s53.473-56.5,74.963-175S124.914,0,124.914,0H0Z"></path>
            </svg>

            <svg class="right"
                 viewBox="0 0 500 500"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M325.529,500s-50.117-80.37,50.118-124.8S500,350,500,350V500H325.529Z"></path>
            </svg>
        </div>

        <!-- Actual application -->
        <cloudfront class="app-content"/>

    </div>
</template>

<script>

    // Font-awesome styles
    import '@fortawesome/fontawesome-free/css/all.css';

    // Normalize css to look (almost) equal on all browsers
    import 'normalize.css';

    // Themes
    import '../scss/themes.scss';

    // Components
    import Cloudfront from './components/Cloudfront';

    export default {

        components: {Cloudfront},

        data() {
            return {
                disableTransitions: false
            };
        },

        computed: {
            theme() {
                const {
                    settings: {user},
                    features: {preferredColorScheme}
                } = this.$store.state;

                // Check if user enabled to prefer the current color theme
                if (user.usePreferredColorScheme && preferredColorScheme.value) {
                    switch (preferredColorScheme.value) {
                        case 'dark':
                            return 'dark';
                        case 'light':
                            return 'light';
                    }
                } else if (!user.theme) {
                    return localStorage.getItem('theme') || 'light';
                }

                return user.theme;
            }
        },

        watch: {
            theme: {
                deep: true,
                handler(theme) {
                    localStorage.setItem('theme', theme);

                    // Disable transition during repaint
                    this.disableTransitions = true;
                    requestAnimationFrame(() => {
                        this.disableTransitions = false;

                        // Update page theme
                        this.$utils.updatePageTheme(
                            `rgb(${getComputedStyle(this.$refs.app).getPropertyValue('--primary-background-color')})`
                        );
                    });
                }
            }
        },

        async created() {

            // Try to recreate session
            const apikey = localStorage.getItem('apikey');

            if (apikey) {
                await this.$store.dispatch('auth/key', {apikey});
            }

            // Listen for logs
            this.$store.commit('errors/listen');

            // Listen for prefers-color-scheme changes
            const {features} = this.$store.state;

            if (features.preferredColorScheme.available) {
                const submit = type => this.$store.commit('features/update', {
                    name: 'preferredColorScheme',
                    value: type
                });

                submit('unset');
                for (const type of ['dark', 'light']) {
                    const mql = matchMedia(`(prefers-color-scheme: ${type})`);
                    mql.addEventListener('change', e => e.matches && submit(type));
                    mql.matches && submit(type);
                }
            }
        }
    };

</script>

<style lang="scss">
    html,
    body,
    #app {
        height: 100%;
        width: 100%;
    }

    #app {
        background: RGB(var(--secondary-background-color));
        font-family: $font-family;

        &.disable-transitions {
            * {
                transition: none !important;
            }
        }
    }

    .app-background {
        position: fixed;
        @include position(0, 0, 0, 0);

        svg {
            position: fixed;
            fill: RGB(var(--theme-secondary));
            @include size(100vmax);

            @include animate('1s ease') {
                from {
                    transform: scaleX(1.5);
                }
                to {
                    transform: none;
                }
            }
        }

        .left {
            left: 0;
            top: 0;
        }

        .right {
            right: 0;
            bottom: 0;
        }
    }

    .app-content {
        position: absolute;
        @include width(90%, 0, 1400px);
        @include height(90%, 0, 950px);
        @include position(0, 0, 0, 0);
        border-radius: 0.5em;
        margin: auto;
        box-shadow: 0 0.4em 3em 0 rgba(black, 0.15);
    }

    .selection-area {
        background: RGBA(var(--focus-color), 0.02);
        border: 1px solid RGBA(var(--focus-color), 0.6);
    }

    // Font awesome default size
    [class^='fa'] {
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
    }

    // Switch to fullscreen mode if window is too small
    @include mq-tablets {
        .app-content {
            min-width: 100%;
            min-height: 100%;
            border-radius: 0;
        }
    }
</style>
