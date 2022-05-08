<template>
  <div class="icon" style="overflow: hidden; filter: grayscale(100%)">
    <span class="fa-stack fa-2x">
      <i class="fa-solid fa-stack-1x fa-inverse letters">{{ initials }}</i>
    </span>
  </div>
</template>

<script>
export default {
  props: ["initials"],
};
</script>

<style>
.letters {
  margin-top: -1px;
  margin-left: 18px;
  transform: rotate(342deg);
  acity: 0.3;
  font-size: 16px;
  letter-spacing: 2px;
  font-weight: 300;
  color: #3c3c3c;
  text-shadow: 0px 3px #000000;
}
</style>
