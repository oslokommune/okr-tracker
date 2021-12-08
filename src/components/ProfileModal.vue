<template>
  <div class="profilemodal__overlay " @click.self="close">

    <div class="modal__main--flex" :class="[ me? 'profilemodal__upper-right' : 'profilemodal__centered']">
      <div v-if="me" class="closeBtn" >
        <a href="#" @click="close"><i class="icon fa fa-white fa-fw fa-times-circle"/></a>
      </div>

      <div class="column">
        <div class="profilemodal__heading">{{ $t('user.profile')}}</div>
        <validation-observer v-slot="{ handleSubmit }">
          <form id="updateUser" @submit.prevent="handleSubmit(save)">
            <span class="profilemodal__label">{{ $t('fields.name') }}</span>
            <input
              v-model="thisUser.displayName"
              rules="required"
              :disabled="!me"
              @input="edit"
              class="profilemodal__input"
            />
          </form>
        </validation-observer>
        <label class="form-group">
          <span class="profilemodal__label">{{ $t('user.position.title') }}</span>
          <v-select
            v-if="me"
            v-model="thisUser.position"
            :options="jobPositions"
            :get-option-label="(option) => $t(`user.position.${option}`)"
            :disabled="!me"
            class=""
            @input="edit"
          >
          </v-select>
          <div v-else class="profilemodal__input">
            <span>
              {{ thisUser && thisUser.position? thisUser.position : $t('user.position.member') }}
            </span>
          </div>
        </label>
        <label v-if="me" class="form-group">
          <span class="profilemodal__label">{{ $t('user.selectLanguage') }}</span>
          <v-select
            v-model="thisUser.preferences.lang"
            :options="languages"
            :get-option-label="(option) => $t(`languages.${option}`)"
            @input="edit"
          >
          </v-select>
        </label>
        <div v-if="me" class="profilemodal__save-button">
          <button class="btn btn--sec" form="updateUser" :disabled="loading || !changes">{{ $t('btn.save') }}</button>
        </div>
      </div>
      <div class="column">
        <div v-if="me" class="profilemodal__heading">
          {{ $t('user.access') }}
        </div>
        <template v-if="me && user.superAdmin">
          <div class="profile__admin">
            <h2 class="title-2">{{ $t('user.superAdmin') }}</h2>
            <div>{{ $t('user.hasSuperAdmin') }}</div>
          </div>
        </template>

        <template v-if="me && user.admin && user.admin.length > 0">
          <div class="profile__admin">
            <h2 class="title-2">{{ $t('user.admin') }}</h2>
            <div>{{ $t('user.hasAdmin') }}</div>
          </div>
        </template>

        <div class="profilemodal__heading">
          {{ me? $t('user.myProducts') : $t('user.products')}}
        </div>

        <div>
          <ul>
            <li v-for="product in products" :key="product.id">
              <div class="profilemodal__label">{{ product.department.name }}</div>
              <div class="product">{{ product.name }}</div>
            </li>
          </ul>
        </div>
        <div v-if="me" class="profilemodal__heading">
          {{ $t('general.admin') }}
        </div>
        <div v-if="me" class="sidebar__group sidebar__bottom button-col">
          <theme-toggle />
          <router-link v-if="user.admin" :to="{ name: 'Admin' }" class="modal__link">
            <span>{{ $t('general.admin') }}</span>
          </router-link>
          <router-link :to="{ name: 'Help' }" class="modal__link">
            <span>{{ $t('general.help') }}</span>
          </router-link>
          <button class="modal__link" @click="signOut">
            <span class="">{{ $t('general.signOut') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { db } from '@/config/firebaseConfig';
  import { auth } from '@/config/firebaseConfig';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import User from '@/db/User';
  import { jobPositions } from '@/config/jobPositions';
  import { mapActions } from "vuex";

  export default {
    name: 'ProfileModal',

    components: {
      ThemeToggle,
      User,
      jobPositions,
    },

    props: {
      myProfile: {
        type: Boolean,
        default: false
      },
      id: {
        type: String,
      }
    },

    data: () => ({
      user: null,
      products: [],
      audit: [],
      image: null,
      loading: false,
      changes: false,
      thisUser: null,
      languages: ['nb-NO', 'en-US'],
      jobPositions,
    }),

    computed: {
      me() {
        return this.$store.state.user?.id === this.user?.id;
      },
    },

    watch: {
      id: {
        immediate: true,
        handler(id) {
          const userRef = db.doc(`users/${id}`);
          const productsRef = db
            .collection('products')
            .where('team', 'array-contains', userRef)
            .where('archived', '==', false);
          const auditRef = db.collection('audit').where('user', '==', userRef).orderBy('timestamp', 'desc').limit(10);

          this.$bind('user', userRef);
          this.$bind('products', productsRef, { maxRefDepth: 1 });
          this.$bind('audit', auditRef, { maxRefDepth: 1 });
        },
      },
      user: {
        immediate: true,
        handler() {
          if (this.user) {
            this.thisUser = { ...this.user, id: this.user.id };
          }
        },
      },
    },

    methods: {
      ...mapActions(['reset_state']),

      async save() {
        this.loading = true;
        try {
          await User.update(this.thisUser);
          await this.$router.go();
          this.$toasted.show(this.$t('toaster.savedChanges'));
        } catch (error) {
          console.error(error);
          this.$toasted.error(this.$t('toaster.error.save'));
        }

        this.loading = false;
        this.changes = false;
      },

      async signOut() {
        await auth.signOut();
        await this.reset_state();
      },

      edit() {
        this.changes = true;
      },

      close() {
        this.$emit('close');
      },
    },
  };
</script>
<style lang="scss" scoped>
  @use '@/styles/typography';

  .profilemodal__upper-right {
    position: fixed;
    top: 4.5rem;
    right: 0.5rem;
  }

  .fa-white {color: white;}

  .profilemodal__centered {
    position: fixed;
    horiz-align: center;
    vertical-align: center;
  }

  .closeBtn {
    display: block;
    float:right;
    position:fixed;
    top:1rem;
    right: 1.5rem;
    z-index: 1002;
    font-size: 1.5rem;
  }

  .profilemodal__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100%;
    overflow-y: auto;
    background: rgba(black, 0.5);
  }

  .profilemodal__heading {
    padding-bottom: 1rem;
    padding-top: 1rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  .profile__admin {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .profilemodal__label {
    display: inline-block;
    margin-top: 0.8rem;
    margin-bottom: 0.5rem;
    color: var(--color-grey-300);
    font-weight: 500;
    font-size: typography.$font-size-2;
    letter-spacing: -0.03rem;
  }

  .profilemodal__input {
    width: 100%;
    background: var(--color-grey-50);
    border-radius: 0;
    padding: 0.7rem;
  }

  .modal__link {
    text-decoration: none;
    background: none;
    border: none;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    padding-left: 0rem;
    cursor: pointer;
    text-align: left;
    &:hover {
      font-weight: bold;
    }
  }

  .modal__main--flex {
    z-index: 100;
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    color: var(--color-text);
    background: white;
    border-radius: 1px;
    box-shadow: 0 0.25rem 0.45rem rgba(black, 0.5);
    max-height: calc(100vh - 10px);
    overflow-y: auto;

    @media screen and (min-width: bp(s)){
      flex-direction: row;
    }
  }

  .column {
    flex-grow: 2;
    min-width: 50%;
    padding: 3rem;
  }

  .profilemodal__save-button {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    margin-top: 4rem;
    padding-bottom: 1.5rem;
  }

  .product__parent {
    margin-bottom: 1rem;
  }

  .product {
    margin-bottom: 1rem;
    padding: 0.75rem 0.75rem 0.6rem 0.75rem;
    color: var(--color-text);
    font-weight: 500;
    border: 1px solid black;
    border-radius: 0px;
  }

  .btn--label {
    color: var(--color-text-secondary);
  }
</style>
