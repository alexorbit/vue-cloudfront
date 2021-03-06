<template>
    <div v-if="settings.static.introBoxes.includes(id)"
         ref="introBox"
         class="intro-box"
         @click="toggle">

        <!-- Bouncing question mark -->
        <svg class="question-mark"
             height="31"
             viewBox="0 0 31 31"
             width="31"
             xmlns="http://www.w3.org/2000/svg">
            <path
                d="M15.068-.013C20.569-.013,25,2.089,25,8c0,5.451-5.42,7.917-6.794,9.887-1.032,1.466-.687,3.523-3.524,3.523a2.7,2.7,0,0,1-2.75-2.808c0-4.991,7.518-6.122,7.518-10.232,0-2.263-1.544-3.6-4.124-3.6-5.5,0-4.3,5.124-7.326,5.233C6.5,10,5.043,9,5.012,7.743,5.012,3.631,9.825-.013,15.068-0.013ZM14.854,24.132a3.439,3.439,0,1,1-3.525,3.438A3.5,3.5,0,0,1,14.854,24.132Z"></path>
        </svg>

        <!-- Moving circles -->
        <span class="inner-circle"></span>
        <span class="outer-circle"></span>

        <!-- Text display -->
        <div :class="{'content-wrap': 1, visible}">
            <div ref="introContent"
                 :class="{introduction: true, visible}">

                <div class="header">
                    <h1><i class="fa fa-fw fa-question-circle"></i>{{ header }}</h1>

                    <svg viewBox="0 0 500 500"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M26.178,311.221C30.934,213.593,48.052,81.843,252.526,55.3S491.238,400.319,467.462,438.232s-84.643-59.714-207.327-53.079S21.423,408.849,26.178,311.221Z"></path>
                    </svg>
                </div>

                <div class="content">
                    <p>{{ text }}</p>

                    <div class="actions">
                        <span class="skip"
                              @click="closeAll">Skip all</span>

                        <button @click="close">
                            <span>Okay</span>
                            <i class="fas fa-fw fa-check"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>

    </div>
</template>

<script>

    // Vuex stuff
    import {mapState} from 'vuex';

    export default {

        props: {
            text: {
                type: String,
                required: true
            },

            header: {
                type: String,
                required: true
            },

            id: {
                type: String,
                required: true
            }
        },

        data() {
            return {
                visible: false,
                closeEventListenerProps: []
            };
        },

        computed: {
            ...mapState(['settings'])
        },

        methods: {

            toggle() {
                if (this.visible) {
                    this.visible = false;
                } else {
                    const {introBox, introContent} = this.$refs;

                    // Center introductionbox below eye-catcher
                    const ibc = introBox.getBoundingClientRect();
                    const icc = introContent.getBoundingClientRect();
                    introContent.style.marginLeft = `-${icc.width / 2 - ibc.width / 2}px`;

                    // Show introbox
                    this.visible = true;
                    this.visible = true;
                    this.closeEventListenerProps = this.$utils.on(window, 'mousedown', e => {

                        // Detect click outside of the intro box
                        if (!this.$utils.eventPath(e).includes(introBox)) {
                            this.visible = false;
                            this.$utils.off(...this.closeEventListenerProps);
                        }
                    });
                }
            },

            close() {
                this.$store.dispatch('settings/change', stats => {
                    stats.static.introBoxes = stats.static.introBoxes.filter(v => v !== this.id);
                    return stats;
                });
            },

            closeAll() {
                this.$store.dispatch('settings/change', stats => {
                    stats.static.introBoxes = [];
                    return stats;
                });
            }
        }
    };

</script>

<style lang="scss" scoped>

    .intro-box {
        position: absolute;
        @include size(35px);
        @include position(-15px, -20px, auto, auto);
    }

    .question-mark {
        position: absolute;
        @include position(-150%, 0, 0, 0);
        @include size(20px);
        margin: auto;
        overflow: visible;
        opacity: 0.9;
        fill: RGB(var(--theme-primary));
        cursor: pointer;

        @include animate('1.5s ease-in-out infinite') {
            0% {
                transform: none;
            }
            50% {
                transform: translate3d(0, -3px, 0);
            }
            100% {
                transform: none;
            }
        }

        animation-delay: 0.25s;
    }

    .inner-circle,
    .outer-circle {
        @include position(0, 0, 0, 0);
        position: absolute;
        margin: auto;
        display: inline-block;
        border-radius: 100%;
        cursor: pointer;
        z-index: 1;

        @include animate('1.5s ease-in-out infinite') {
            0% {
                transform: scale(1);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.25);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0.5;
            }
        }
    }

    .inner-circle {
        @include size(16px);
        border: 2px solid RGB(var(--theme-secondary));
        animation-delay: 0.25s;
    }

    .outer-circle {
        @include size(20px);
        border: 2px solid RGB(var(--theme-primary));
    }

    .introduction {
        position: fixed;
        background: RGB(var(--primary-background-color));
        border-radius: 0.2em;
        width: 15em;
        z-index: 1;
        opacity: 0;
        pointer-events: none;
        transform: translateY(2em) rotateX(-10deg) perspective(100px);
        transition: opacity 0.3s, transform 0.3s;
        filter: var(--drop-shadow-big);

        &.visible {
            opacity: 1;
            transform: translateY(3em) perspective(100px);
            pointer-events: all;
        }

        &::before {
            @include pseudo();
            @include position(-20px, 0, auto, 0);
            @include size(0);
            margin: auto;
            border: 10px solid transparent;
            border-bottom-color: RGB(var(--theme-primary));
        }

        .header {
            position: relative;
            background: RGB(var(--theme-primary));
            padding: 0.75em 0.75em;
            color: #fff;
            border-radius: 0.2em 0.2em 0 0;
            overflow: hidden;

            h1 {
                @include font(400, 0.9em);

                i {
                    font-size: 1em;
                    margin-right: 0.5em;
                }
            }

            svg {
                position: absolute;
                @include position(-50%, -10%, -10%, auto);
                transform: rotate(30deg);
                margin: auto;
                height: 150%;
                fill: RGB(var(--theme-secondary));
            }
        }

        .content {
            @include flex(column);
            padding: 1em 0.75em;
            border-radius: 0 0 0.1em 0.25em;

            p {
                @include font(400, 0.8em);
                line-height: 1.3em;
                color: RGBA(var(--primary-text-color), 0.75);
            }

            .actions {
                @include flex(row, flex-end, flex-end);

                button {
                    @include flex(row, center);
                    background: RGBA(var(--primary-text-color), 0.1);
                    padding: 0.5em 0.85em 0.55em;
                    margin-top: 1em;
                    margin-left: 1em;
                    color: RGBA(var(--primary-text-color), 0.5);
                    border-radius: 0.15em;
                    transition: all 0.3s;
                    @include font(600, 0.7em);

                    &:hover {
                        background: RGB(var(--theme-primary));
                        color: RGB(var(--primary-background-color));
                    }

                    i {
                        font-size: 0.9em;
                        margin-left: 0.5em;
                        margin-top: 0.2em;
                    }
                }

                .skip {
                    font-size: 0.8em;
                    text-decoration: underline;
                    color: RGBA(var(--secondary-text-color), 0.75);
                    cursor: pointer;
                    transition: all 0.3s;

                    &:hover {
                        color: RGB(var(--theme-primary));
                    }
                }
            }
        }
    }

    @include mq-tablets {
        .intro-box {
            display: none;
        }
    }


</style>
