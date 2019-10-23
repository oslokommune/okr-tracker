<template>
  <div class="item">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        <path
          d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 77.9 131.7 171.9 142.4C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6C498.4 275.6 576 210.3 576 144V88c0-13.3-10.7-24-24-24zM64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-47.5-16.4-77-49.9-77-70.2zm448 0c0 20.2-29.4 53.8-77 70.2 7-25 11.8-53.6 12.8-86.2H512v16zm-127.3 4.7l-39.6 38.6 9.4 54.6c1.7 9.8-8.7 17.2-17.4 12.6l-49-25.8-49 25.8c-8.8 4.6-19.1-2.9-17.4-12.6l9.4-54.6-39.6-38.6c-7.1-6.9-3.2-19 6.7-20.5l54.8-8 24.5-49.6c4.4-8.9 17.1-8.9 21.5 0l24.5 49.6 54.8 8c9.6 1.5 13.5 13.6 6.4 20.5z"
        />
      </svg>
    </div>
    <div class="item__text">
      <h3 class="title-3">{{ objective.objective_title }}</h3>
      <p>{{ objective.objective_body }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.item {
  display: grid;
  grid-gap: 1rem;
  grid-template-areas: 'icon text';
  grid-template-rows: 1fr;
  grid-template-columns: 4rem 1fr;
  height: 100%;
  margin-bottom: 1rem;

  &__text {
    grid-area: text;
    padding-right: 1.5rem;

    h3 {
      margin: 0 0 0.25rem;
    }
  }
}

.icon {
  display: flex;
  grid-area: icon;
  align-content: center;
  width: 4rem;
  height: 4rem;
  padding: 1rem;

  background: $color-yellow;

  svg {
    width: 100%;

    fill: $color-purple;
  }
}
</style>
