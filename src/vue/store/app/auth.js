export const auth = {

    namespaced: true,

    state: {

        /**
         * Session-key which can an and should be used to fetch data or perform actions.<
         * Is used in the nodes store module.
         */
        apikey: null
    },
    actions: {

        async logout() {
            localStorage.removeItem('apikey');
            location.reload(true);
        },

        /**
         * Authenticates a user
         * @param state
         * @param credentials username, password and so on.
         */
        async login({state}, credentials) {
            return this.dispatch('fetch', {
                route: 'login',
                body: credentials
            }).then(({apikey}) => {

                // Save apikey to localstorage and update module
                localStorage.setItem('apikey', apikey);
                state.apikey = apikey;

                // Jump to home tab
                this.commit('setActiveTab', 'home');

                // Update events and nodes
                return Promise.all([this.dispatch('nodes/update'), this.dispatch('events/update')]);
            });
        },

        /**
         * Authenticates a user
         * @param state
         * @param credentials username, password and so on.
         */
        async register({state}, credentials) {
            return this.dispatch('fetch', {
                route: 'register',
                body: credentials
            }).then(({apikey}) => {

                // Save apikey to localstorage and update module
                localStorage.setItem('apikey', apikey);
                state.apikey = apikey;

                // Jump to home tab
                this.commit('setActiveTab', 'home');

                // Update nodes
                return Promise.all([
                    this.dispatch('events/sync'),
                    this.dispatch('nodes/update'),
                    this.dispatch('events/update')
                ]);
            });
        },

        /**
         * Checks an existing apikey
         * @param state
         * @param apikey
         */
        async key({state}, {apikey}) {
            return this.dispatch('fetch', {
                route: 'checkApiKey',
                body: {apikey}
            }).then(() => {
                state.apikey = apikey;

                // Update nodes
                return Promise.all([this.dispatch('nodes/update'), this.dispatch('events/update')]);
            }).catch(() => {
                this.dispatch('auth/logout');
            });
        },

        /**
         * Responsible for changing the password or username, if this promise
         * gets rejected String is used as error message.
         *
         * @param state
         * @param currentPassword Current password
         * @param newUsername New username (optional)
         * @param newPassword New passoword (optional)
         * @returns {Promise<void>}
         */
        async applySettings({state}, {currentPassword, newUsername, newPassword}) {
            return this.dispatch('fetch', {
                route: 'settings',
                body: {
                    apikey: state.apikey,
                    currentPassword,
                    newUsername,
                    newPassword
                }
            }).then(() => {

                // Logout
                this.dispatch('auth/logout');
            });
        },

        /**
         * Responsible to delete the accound (and all files)
         *
         * @param password - Current password
         * @returns {Promise<void>}
         */
        async deleteAccount({state}, {password}) {
            return this.dispatch('fetch', {
                route: 'deleteAccount',
                body: {
                    apikey: state.apikey,
                    password
                }
            }).then(() => {

                // Logout
                this.dispatch('auth/logout');
            });
        }
    }
};
