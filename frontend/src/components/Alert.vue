<template>
  <div
    class="alert d-flex flex-row justify-space-between p-3"
    :class="type"
    v-if="show"
  >
    <!--  -->
    <v-icon icon="mdi-bell"></v-icon>
    <span>{{ message }}</span>
    <v-icon icon="mdi-close" @click="show = false"></v-icon>
  </div>
  <!-- <a href="#" @click="alert.success('Prueba de mensaje asdfsd')">Success</a>
  <br />
  <a href="#" @click="alert.success('Prueba de mensaje asdfsd', -1)"
    >Success persistent</a
  >
  <br />
  <a href="#" @click="alert.error('Prueba de mensaje asdfsd')">Error</a>
  <br />
  <a href="#" @click="alert.error('Prueba de mensaje asdfsd', -1)"
    >Error persistent</a
  >
  <br />
  <a href="#" @click="alert.hide()">Ocultar</a> -->
</template>

<script setup>
import useAlert from "@/composables/useAlert";

const { message, type, show, alert } = useAlert();
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables" as *;

.alert-success {
  background: $primary-color;
  color: $white;
  font-weight: 600;
  border-radius: 5px;
}
.alert-error {
  background: $secondary-color;
  color: $white;
  font-weight: 600;
  border-radius: 5px;
}
</style>
