<script setup lang="ts">
import WelcomeItem from "./WelcomeItem.vue";
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <i class="fa-solid fa-dice"></i>
    </template>
    <template #heading>Welcome to kcapp Odds Game!</template>

    What is kcapp Odds Game?<br />
    It is a betting web app for kcapp tournament results. Odds Game is connected
    to ongoing tournament, where you can bet for outcomes of matches.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <i class="fa-solid fa-coins"></i>
    </template>
    <template #heading>Betting</template>
    What do I bet?<br />
    Every user gets an in-game currency: KcappCoins. A 1000 of those to start
    with and bet on upcoming match results. You spend a certain amount on player
    A vs player B game. If you predicted the winner correctly, you get your bet
    amount multiplied by our odds calculation.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <i class="fa-solid fa-medal"></i>
    </template>
    <template #heading>Why?</template>
    Because we think it's fun. You bet on real players in kcapp tournament.
    <br />
    See if you can predict results of all games. The user with most coins wins.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <i class="fa-solid fa-circle-question"></i>
    </template>
    <template #heading>Got questions?</template>
    Ask your question on slack channel
    <span class="green">#trd-offtopic-darts</span>.
  </WelcomeItem>
</template>
