<template>
  <div class="overview-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <button class="back-btn" @click="backToProducts">
          <el-icon :size="16"><ArrowLeft /></el-icon>
          返回产品服务
        </button>
        <h1 class="page-title">数据分析服务 · 方案概览</h1>
        <p class="page-subtitle">
          对照多维报表、可视化大屏、智能预警与趋势分析四类能力，查看数据分析平台与现有仓储、运输、配送方案的衔接情况
        </p>
      </div>
    </section>

    <!-- 当前方案切换 -->
    <section class="section section-light solution-switcher-section">
      <div class="container">
        <div class="switcher-card">
          <div class="switcher-left">
            <div class="switcher-label">当前对照方案</div>
            <div class="solution-tabs">
              <button
                v-for="solution in businessSolutions"
                :key="solution.id"
                class="solution-tab"
                :class="{ active: activeSolution === solution.id }"
                @click="switchSolution(solution.id)"
              >
                <el-icon :size="16"><component :is="solution.icon" /></el-icon>
                {{ solution.shortName }}
              </button>
            </div>
          </div>
          <div class="switcher-current">
            <div class="current-icon" :style="{ background: currentSolution.gradient }">
              <el-icon :size="22"><component :is="currentSolution.icon" /></el-icon>
            </div>
            <div class="current-info">
              <h3>{{ currentSolution.name }}</h3>
              <p>{{ currentSolution.desc }}</p>
              <div class="data-sources">
                <span class="data-sources-label">已接入数据源：</span>
                <el-tag
                  v-for="source in currentSolution.dataSources"
                  :key="source"
                  size="small"
                  effect="plain"
                  class="source-tag"
                >
                  {{ source }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据分析能力清单 -->
    <section class="section section-gray">
      <div class="container">
        <SectionTitle
          title="数据分析能力"
          subtitle="数据分析平台提供的四类核心能力，统一服务于仓储、运输、配送各业务方案"
        />
        <div class="capability-grid">
          <div class="capability-card" v-for="capability in capabilities" :key="capability.id">
            <div class="capability-icon">
              <el-icon :size="28"><component :is="capability.icon" /></el-icon>
            </div>
            <h3>{{ capability.name }}</h3>
            <p>{{ capability.desc }}</p>
            <ul class="capability-highlights">
              <li v-for="item in capability.highlights" :key="item">
                <el-icon :size="14"><Check /></el-icon>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 与当前方案的衔接明细 -->
    <section class="section section-light">
      <div class="container">
        <SectionTitle
          :title="`与${currentSolution.name}的衔接`"
          subtitle="逐项说明四类能力在当前方案下的适配状态；能力缺项、数据为空或暂不适配时同步说明原因"
        />

        <!-- 状态汇总 -->
        <div class="stats-bar">
          <div
            v-for="item in statusSummary"
            :key="item.key"
            class="stats-item"
            :class="{ 'is-zero': item.count === 0 }"
          >
            <el-icon :size="18" :style="{ color: item.meta.color }">
              <component :is="item.meta.icon" />
            </el-icon>
            <span class="stats-count">{{ item.count }}</span>
            <span class="stats-label">{{ item.meta.label }}</span>
          </div>
          <div class="stats-link">
            <router-link
              :to="{ path: '/products', query: { tab: currentSolution.id }, hash: `#product-${currentSolution.id}` }"
            >
              查看{{ currentSolution.name }}产品详情
              <el-icon :size="14"><ArrowRight /></el-icon>
            </router-link>
          </div>
        </div>

        <!-- 衔接明细列表 -->
        <div class="linkage-list">
          <div
            v-for="capability in capabilities"
            :key="capability.id"
            class="linkage-item"
            :class="`is-${cellOf(capability.id).status}`"
          >
            <div class="linkage-head">
              <div class="linkage-title">
                <el-icon :size="20" class="linkage-cap-icon"><component :is="capability.icon" /></el-icon>
                <h4>{{ capability.name }}</h4>
              </div>
              <span
                class="status-chip"
                :style="{
                  color: statusMeta(cellOf(capability.id).status).color,
                  background: `${statusMeta(cellOf(capability.id).status).color}14`,
                  borderColor: `${statusMeta(cellOf(capability.id).status).color}55`
                }"
              >
                <el-icon :size="14"><component :is="statusMeta(cellOf(capability.id).status).icon" /></el-icon>
                {{ statusMeta(cellOf(capability.id).status).label }}
              </span>
            </div>

            <p class="linkage-summary">{{ cellOf(capability.id).summary }}</p>

            <!-- 已覆盖指标 -->
            <div v-if="cellOf(capability.id).metrics.length" class="linkage-metrics">
              <span class="metrics-label">已覆盖指标：</span>
              <el-tag
                v-for="metric in cellOf(capability.id).metrics"
                :key="metric"
                size="small"
                type="success"
                effect="light"
                class="metric-tag"
              >
                {{ metric }}
              </el-tag>
            </div>

            <!-- 缺项 / 空数据 / 不适配原因 -->
            <el-alert
              v-if="cellOf(capability.id).reason"
              :title="reasonTitle(cellOf(capability.id).status)"
              :type="statusMeta(cellOf(capability.id).status).alertType"
              :closable="false"
              show-icon
              class="reason-alert"
            >
              <div class="reason-body">
                <p class="reason-text">{{ cellOf(capability.id).reason }}</p>
                <p v-if="cellOf(capability.id).action" class="reason-action">
                  <el-icon :size="14"><Tools /></el-icon>
                  <span>{{ cellOf(capability.id).action }}</span>
                </p>
              </div>
            </el-alert>
          </div>
        </div>
      </div>
    </section>

    <!-- 全方案衔接对照矩阵 -->
    <section class="section section-gray">
      <div class="container">
        <SectionTitle
          title="能力 × 方案衔接对照"
          subtitle="横向对照四类能力在仓储、运输、配送方案中的状态，点击列可切换当前方案"
        />

        <div class="matrix-wrapper">
          <div class="matrix-table">
            <!-- 表头 -->
            <div class="matrix-row matrix-header-row">
              <div class="matrix-cell matrix-corner">能力 ＼ 方案</div>
              <div
                v-for="solution in businessSolutions"
                :key="solution.id"
                class="matrix-cell matrix-col-head"
                :class="{ active: activeSolution === solution.id }"
                @click="switchSolution(solution.id)"
              >
                <el-icon :size="16"><component :is="solution.icon" /></el-icon>
                <span>{{ solution.shortName }}</span>
                <el-tag v-if="activeSolution === solution.id" size="small" type="primary" effect="dark">
                  当前
                </el-tag>
              </div>
            </div>

            <!-- 数据行 -->
            <div
              v-for="capability in capabilities"
              :key="capability.id"
              class="matrix-row"
            >
              <div class="matrix-cell matrix-row-head">
                <el-icon :size="16"><component :is="capability.icon" /></el-icon>
                {{ capability.name }}
              </div>
              <div
                v-for="solution in businessSolutions"
                :key="solution.id"
                class="matrix-cell matrix-data-cell"
                :class="{ active: activeSolution === solution.id }"
                @click="switchSolution(solution.id)"
              >
                <span
                  class="matrix-dot"
                  :style="{ background: statusMeta(cellOfSolution(solution.id, capability.id).status).color }"
                ></span>
                <span class="matrix-status-label" :style="{ color: statusMeta(cellOfSolution(solution.id, capability.id).status).color }">
                  {{ statusMeta(cellOfSolution(solution.id, capability.id).status).label }}
                </span>
                <p class="matrix-cell-summary">{{ cellOfSolution(solution.id, capability.id).summary }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="legend">
          <div v-for="meta in legendItems" :key="meta.key" class="legend-item">
            <span class="legend-dot" :style="{ background: meta.color }"></span>
            <span class="legend-label">{{ meta.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 咨询入口（与原有产品页保持一致） -->
    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="cta-title">希望结合当前方案深入评估数据分析能力？</h2>
        <p class="cta-desc">我们的专家团队将结合仓储、运输、配送业务现状提供一对一咨询</p>
        <div class="cta-actions">
          <el-button size="large" round class="back-outline-btn" @click="backToProducts">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            返回产品服务
          </el-button>
          <el-button type="primary" size="large" round @click="$router.push('/contact')">
            立即咨询
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionTitle from '@/components/SectionTitle.vue'
import {
  CAPABILITY_STATUS,
  capabilities,
  businessSolutions,
  SOLUTION_IDS,
  ACTIVE_SOLUTION_STORAGE_KEY,
  getMatrixCell,
  getSolutionStats
} from '@/data/analysisOverview.js'

const route = useRoute()
const router = useRouter()

const isValidSolution = (id) => SOLUTION_IDS.includes(id)

// 初始方案优先级：URL query → sessionStorage（上次选择）→ 默认仓储方案
const resolveInitialSolution = () => {
  const fromQuery = route.query.solution
  if (isValidSolution(fromQuery)) return fromQuery
  const fromStorage = window.sessionStorage.getItem(ACTIVE_SOLUTION_STORAGE_KEY)
  if (isValidSolution(fromStorage)) return fromStorage
  return SOLUTION_IDS[0]
}

const activeSolution = ref(resolveInitialSolution())

const currentSolution = computed(() => {
  return businessSolutions.find(item => item.id === activeSolution.value) || businessSolutions[0]
})

const statusSummary = computed(() => {
  const stats = getSolutionStats(activeSolution.value)
  return Object.keys(CAPABILITY_STATUS).map(key => ({
    key,
    count: stats[key],
    meta: CAPABILITY_STATUS[key]
  }))
})

const legendItems = Object.values(CAPABILITY_STATUS)

const statusMeta = (status) => CAPABILITY_STATUS[status] || CAPABILITY_STATUS.gap

const cellOf = (capabilityId) => getMatrixCell(activeSolution.value, capabilityId)

const cellOfSolution = (solutionId, capabilityId) => {
  return getMatrixCell(solutionId, capabilityId) || { status: 'gap', summary: '暂无衔接信息' }
}

const reasonTitle = (status) => {
  const titleMap = {
    partial: '部分适配说明',
    gap: '能力缺项原因',
    empty: '数据为空原因',
    na: '不适配当前业务的原因'
  }
  return titleMap[status] || '原因说明'
}

// 切换产品方案：更新本地状态、URL query 与 sessionStorage，保证返回或重新进入后仍与当前方案对应
const switchSolution = (solutionId) => {
  if (!isValidSolution(solutionId) || solutionId === activeSolution.value) return
  activeSolution.value = solutionId
  window.sessionStorage.setItem(ACTIVE_SOLUTION_STORAGE_KEY, solutionId)
  router.replace({
    path: route.path,
    query: { ...route.query, solution: solutionId }
  })
}

// 浏览器前进/后退（query 变化）时同步当前方案
watch(() => route.query.solution, (value) => {
  if (isValidSolution(value) && value !== activeSolution.value) {
    activeSolution.value = value
    window.sessionStorage.setItem(ACTIVE_SOLUTION_STORAGE_KEY, value)
  }
})

const backToProducts = () => {
  router.push({ path: '/products', query: { tab: 'data' }, hash: '#product-data' })
}

onMounted(() => {
  // 重新进入时若 URL 未带方案参数，补齐为当前方案，使刷新、分享链接后概览仍与当前方案对应
  if (!isValidSolution(route.query.solution)) {
    router.replace({
      path: route.path,
      query: { ...route.query, solution: activeSolution.value }
    })
  }
  window.sessionStorage.setItem(ACTIVE_SOLUTION_STORAGE_KEY, activeSolution.value)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: $spacing-xxl 0 $spacing-xl;
  text-align: center;
  color: #fff;
}

.back-btn {
  position: absolute;
  left: $spacing-lg;
  top: $spacing-lg;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: $radius-md;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #fff;
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
}

.page-title {
  font-size: $font-size-xxxl;
  font-weight: 700;
  margin-bottom: $spacing-sm;
}

.page-subtitle {
  font-size: $font-size-base;
  opacity: 0.75;
  max-width: 760px;
  margin: 0 auto;
  line-height: $line-height-loose;
}

// 方案切换卡片
.switcher-card {
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg $spacing-xl;
  display: flex;
  gap: $spacing-xl;
  align-items: center;
}

.switcher-left {
  flex: 0 0 auto;
}

.switcher-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.solution-tabs {
  display: flex;
  gap: $spacing-sm;
}

.solution-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $bg-white;
  color: $text-regular;
  font-size: $font-size-base;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: $primary-color;
    border-color: $primary-color;
  }

  &.active {
    background: $primary-color;
    border-color: $primary-color;
    color: #fff;
  }
}

.switcher-current {
  flex: 1;
  display: flex;
  gap: $spacing-md;
  align-items: flex-start;
  padding-left: $spacing-xl;
  border-left: 1px solid $border-light;
}

.current-icon {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.current-info {
  h3 {
    font-size: $font-size-lg;
    color: $text-primary;
    margin-bottom: 4px;
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: $line-height-base;
    margin-bottom: $spacing-sm;
  }
}

.data-sources {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.data-sources-label {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.source-tag {
  border-radius: $radius-sm;
}

// 能力卡片
.capability-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
}

.capability-card {
  background: $bg-white;
  border-radius: $radius-lg;
  padding: $spacing-xl $spacing-lg;
  box-shadow: $shadow-md;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: $shadow-lg;
  }

  h3 {
    font-size: $font-size-lg;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: $line-height-loose;
    margin-bottom: $spacing-md;
  }
}

.capability-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.capability-highlights {
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-sm;
    color: $text-regular;
    margin-bottom: 8px;

    .el-icon {
      color: $success-color;
      flex: 0 0 auto;
    }
  }
}

// 状态汇总条
.stats-bar {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  flex-wrap: wrap;
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-md $spacing-xl;
  margin-bottom: $spacing-lg;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8px;

  &.is-zero {
    opacity: 0.45;
  }
}

.stats-count {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $text-primary;
}

.stats-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.stats-link {
  margin-left: auto;

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-sm;
    color: $primary-color;

    &:hover {
      color: $primary-dark;
    }
  }
}

// 衔接明细
.linkage-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.linkage-item {
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg $spacing-xl;
  border-left: 4px solid $success-color;

  &.is-partial { border-left-color: $warning-color; }
  &.is-gap { border-left-color: $danger-color; }
  &.is-empty { border-left-color: $info-color; }
  &.is-na { border-left-color: #8c8c8c; }
}

.linkage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.linkage-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .linkage-cap-icon {
    color: $primary-color;
  }

  h4 {
    font-size: $font-size-lg;
    color: $text-primary;
  }
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 999px;
  font-size: $font-size-xs;
  font-weight: 500;
  white-space: nowrap;
}

.linkage-summary {
  font-size: $font-size-sm;
  color: $text-regular;
  line-height: $line-height-loose;
  margin-bottom: $spacing-sm;
}

.linkage-metrics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.metrics-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.metric-tag {
  border-radius: $radius-sm;
}

.reason-alert {
  margin-top: $spacing-md;
  border-radius: $radius-md;
}

.reason-body {
  .reason-text {
    font-size: $font-size-sm;
    line-height: $line-height-loose;
    margin: 0;
  }

  .reason-action {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: $font-size-sm;
    line-height: $line-height-loose;
    margin: 8px 0 0;
    opacity: 0.85;

    .el-icon {
      margin-top: 3px;
      flex: 0 0 auto;
    }
  }
}

// 对照矩阵
.matrix-wrapper {
  overflow-x: auto;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  background: $bg-white;
}

.matrix-table {
  min-width: 760px;
}

.matrix-row {
  display: grid;
  grid-template-columns: 160px repeat(3, 1fr);
}

.matrix-cell {
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-light;
  border-right: 1px solid $border-light;
  font-size: $font-size-sm;
}

.matrix-corner {
  background: #fafbfc;
  color: $text-secondary;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.matrix-col-head {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafbfc;
  color: $text-primary;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba($primary-color, 0.08);
  }

  &.active {
    background: rgba($primary-color, 0.12);
    color: $primary-color;
  }
}

.matrix-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafbfc;
  color: $text-regular;
  font-weight: 500;
}

.matrix-data-cell {
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba($primary-color, 0.04);
  }

  &.active {
    background: rgba($primary-color, 0.07);
  }
}

.matrix-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.matrix-status-label {
  font-size: $font-size-xs;
  font-weight: 600;
  vertical-align: middle;
}

.matrix-cell-summary {
  margin-top: 8px;
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: $line-height-base;
}

// 图例
.legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-lg;
  margin-top: $spacing-lg;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: $font-size-sm;
  color: $text-regular;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

// CTA
.cta-section {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
}

.cta-title {
  font-size: $font-size-xxl;
  font-weight: 700;
  margin-bottom: $spacing-md;
}

.cta-desc {
  font-size: $font-size-lg;
  opacity: 0.85;
  margin-bottom: $spacing-xl;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.back-outline-btn {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.6);
  color: #fff;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.12);
    border-color: #fff;
    color: #fff;
  }
}

@media (max-width: $breakpoint-lg) {
  .capability-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .switcher-card {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-lg;
  }

  .switcher-current {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid $border-light;
    padding-top: $spacing-lg;
  }

  .stats-link {
    margin-left: 0;
    flex-basis: 100%;
  }
}

@media (max-width: $breakpoint-md) {
  .page-title {
    font-size: $font-size-xxl;
    margin-top: $spacing-md;
  }

  .back-btn {
    position: static;
    margin-bottom: $spacing-md;
  }

  .capability-grid {
    grid-template-columns: 1fr;
  }

  .solution-tabs {
    flex-wrap: wrap;
  }

  .solution-tab {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: $font-size-sm;
  }

  .linkage-head {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }
}
</style>
