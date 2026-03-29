<template>
  <main class="profile-settings">
    <section class="profile-settings__card">
      <h1 class="profile-settings__title">Profile settings</h1>
      <p class="profile-settings__description">
        This page is ready for profile icon and locale preferences.
      </p>
    </section>
  </main>
</template>

<style scoped lang="scss">
.profile-settings {
  display: grid;
  place-items: center;
  padding: 24px;

  &__card {
    width: min(680px, 100%);
    border-radius: 16px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(32, 20, 54, 0.08);
    box-shadow: 0 10px 24px rgba(17, 9, 34, 0.08);
  }

  &__title {
    margin: 0;
    font-size: 24px;
    color: #2f2551;
  }

  &__description {
    margin: 10px 0 0;
    color: #4a4168;
  }
}
</style>