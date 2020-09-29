<template>
  <div>
    <ul class="tabs">
      <li>
        <router-link exact class="tab" :to="{ name: 'AdminUsers' }" active-class="active">
          <span class="tab__icon fas fa-user-friends"></span>
          <span class="tab__name">Users</span>
        </router-link>
      </li>

      <li>
        <router-link exact class="tab" :to="{ name: 'AdminItems' }" active-class="active">
          <span class="tab__icon fas fa-cubes"></span>
          <span class="tab__name">Products and departments</span>
        </router-link>
      </li>

      <li>
        <router-link exact class="tab" :to="{ name: 'AdminAccessRequests' }" active-class="active">
          <span class="tab__icon fas fa-user-plus"></span>
          <span class="tab__name">Access requests</span>
        </router-link>
      </li>

      <li>
        <router-link exact class="tab" :to="{ name: 'AdminSystem' }" active-class="active">
          <span class="tab__icon fas fa-cogs"></span>
          <span class="tab__name">System</span>
        </router-link>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'Admin',
};
</script>
