<template>
  <div class="nf-card">
    <div class="nf-card__user" v-if="ready">
      <img
        class="nf-card__avatar"
        :src="user.photoURL || '/placeholder-user.svg'"
        :alt="user.displayName || user.email"
      />
      <div class="nf-card__usertext">
        <router-link v-if="user.slug" :to="{ name: 'profile', params: { slug: user.slug } }">
          <span class="nf-card__displayname">{{ user.displayName || user.email }}</span>
        </router-link>
        <span v-else-if="!user.slug" class="nf-card__displayname">{{ user.displayName || user.email }}</span>

        <span v-if="eventData.event === 'keyRes-update-progress'">
          {{ $t('home.newsfeedCard.updatedKeyres.one') }}
          <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">
            {{ $t('home.newsfeedCard.updatedKeyres.two') }}
          </router-link>
          {{ $t('home.newsfeedCard.updatedKeyres.three') }}

          <router-link :to="product.route">{{ product.name }}</router-link>
        </span>

        <span v-else-if="eventData.event === 'promoted-admin'">
          {{ $t('home.newsfeedCard.adminAdded') }}
        </span>

        <span v-else-if="eventData.event === 'deleted-user'">
          {{ $t('home.newsfeedCard.removedUser', null, { user: eventData.affectedUser }) }}
        </span>

        <span v-else-if="eventData.event === 'create-objective'">
          {{ $t('home.newsfeedCard.objectiveAdded') }}
          <router-link :to="product.route">
            {{ product.name }}
          </router-link>
        </span>

        <span v-else-if="eventData.event === 'archive-objective'">
          {{ $t('home.newsfeedCard.objectiveArchived', null, { objective: objective.name }) }}

          <router-link :to="product.route">
            {{ product.name }}
          </router-link>
        </span>

        <span v-else-if="eventData.event === 'update-objective'">
          {{ $t('home.newsfeedCard.objectiveUpdated', null, { objective: objective.name }) }}

          <router-link :to="product.route">
            {{ product.name }}
          </router-link>
        </span>

        <span v-else-if="eventData.event === 'create-product'">
          {{ $t('home.newsfeedCard.productAdded') }}
          <router-link :to="{ name: 'department', params: { slug: department.slug } }">
            {{ department.name }}
          </router-link>
        </span>

        <span v-else-if="eventData.event === 'archive-product'"
          >{{ $t('home.newsfeedCard.productArchived', null, { product: product.name }) }}»
        </span>

        <span v-else-if="eventData.event === 'update-product'">
          {{ $t('home.newsfeedCard.productUpdated') }}

          <router-link :to="product.route">{{ product.name }}</router-link>
        </span>

        <span v-else-if="eventData.event === 'update-product-image'">
          {{ $t('home.newsfeedCard.productUpdatedImage') }}
          <router-link :to="product.route">{{ product.name }}</router-link>
        </span>

        <span v-else-if="eventData.event === 'added-users'">
          {{ $t('home.newsfeedCard.usersAdded.one') }}
          <strong v-tooltip="JSON.parse(eventData.list).join('<br>')">
            {{
              $t('home.newsfeedCard.usersAdded.two', null, {
                length: JSON.parse(eventData.list).length,
                users: JSON.parse(eventData.list).length === 1 ? 'bruker' : 'brukere',
              })
            }}
          </strong>
        </span>

        <span v-else-if="eventData.event === 'demoted-admin'">
          {{ $t('home.newsfeedCard.adminRemoved') }}
        </span>

        <span v-else-if="eventData.event === 'create-key-result'">
          {{ $t('home.newsfeedCard.keyresAdded.one') }}
          <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">{{
            $t('home.newsfeedCard.keyresAdded.two')
          }}</router-link>
          {{ $t('home.newsfeedCard.keyresAdded.three') }}
          <router-link :to="product.route">{{ product.name }}</router-link>
        </span>

        <span v-else-if="eventData.event === 'update-key-result'">
          {{ $t('home.newsfeedCard.keyresUpdated.one') }}
          <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">{{
            $t('home.newsfeedCard.keyresUpdated.two')
          }}</router-link>
          {{ $t('home.newsfeedCard.keyresUpdated.three') }}
          <router-link :to="product.route">
            {{ product.name }}
          </router-link>
        </span>

        <span v-else-if="eventData.event === 'archive-key-result'">
          {{ $t('home.newsfeedCard.keyresArchived') }}
          <router-link :to="product.route">
            {{ product.name }}
          </router-link>
        </span>

        <span v-else-if="eventData.event === 'update-department'">
          {{ $t('home.newsfeedCard.departmentUpdated') }}
          <router-link :to="{ name: 'department', params: { slug: department.slug } }">
            {{ department.name }}
          </router-link>
        </span>
      </div>
    </div>

    <div v-if="hasBody" class="nf-card__body">
      <template v-if="eventData.event === 'keyRes-update-progress'">
        <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">
          {{ keyResult.description }}
        </router-link>
        <ProgressBar class="nf-progress" :keyres="keyResult"></ProgressBar>
      </template>
    </div>
    <newsfeed-footer :data="eventData"></newsfeed-footer>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { serializeDocument } from '@/db/db';
import ProgressBar from '@/components/ProgressBar.vue';
import NewsfeedFooter from '@/views/Home/components/NewsfeedFooter.vue';

export default {
  components: {
    ProgressBar,
    NewsfeedFooter,
  },

  data: () => ({
    user: null,
    product: null,
    objective: null,
    department: null,
    keyResult: null,
    ready: false,
    hasBody: false,
  }),

  props: {
    eventData: {
      type: Object,
      required: true,
    },
  },

  async created() {
    const { user, keyresRef, productRef, departmentRef, objectiveRef } = this.eventData;

    if (user) {
      this.user = await db
        .doc(`users/${user}`)
        .get()
        .then(d => ({ email: user, ...d.data() }))
        .catch(err => {
          this.$errorHandler('get_user_error', err);
        });
    }

    if (keyresRef) {
      const { fromValue, toValue } = this.eventData;
      this.keyResult = await keyresRef
        .get()
        .then(serializeDocument)
        .then(obj => ({ fromValue, toValue, ...obj }))
        .catch(err => {
          this.$errorHandler('get_keyres_error', err);
        });

      // Replace the value from db with the one from the audit log
      this.keyResult.currentValue = this.eventData.toValue;
    }

    if (productRef) {
      this.product = await productRef
        .get()
        .then(d => d.data())
        .catch(err => {
          this.$errorHandler('get_product_error', err);
        });

      if (productRef.parent.id === 'departments') {
        this.product.route = { name: 'department', params: { slug: this.product.slug } };
      } else if (productRef.parent.id === 'products') {
        this.product.route = { name: 'product', params: { slug: this.product.slug } };
      } else if (productRef.parent.id === 'orgs') {
        this.product.route = { name: 'organization', params: { slug: this.product.slug } };
      }
    }

    if (objectiveRef) {
      this.objective = await objectiveRef
        .get()
        .then(d => d.data())
        .catch(err => {
          this.$errorHandler('get_objective_error', err);
        });
    }

    if (departmentRef) {
      this.department = await departmentRef
        .get()
        .then(d => d.data())
        .catch(err => {
          this.$errorHandler('get_department_error', err);
        });
    }

    if (this.eventData.event === 'keyRes-update-progress') {
      this.hasBody = true;
    }

    this.ready = true;
  },
};
</script>
