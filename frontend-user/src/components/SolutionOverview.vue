<template>
  <div class="solution-overview">
    <!-- 概览头部 -->
    <div class="overview-header">
      <div>
        <div class="overview-tag">
          <el-icon><Connection /></el-icon>
          增值服务 · 方案概览
        </div>
        <h2 class="overview-title">数据分析服务方案概览</h2>
        <p class="overview-desc">
          以数据分析能力对接现有智慧仓储、运输管理、配送调度方案，打通数据孤岛，
          将物流作业数据转化为可决策的业务洞察。
        </p>
      </div>
      <el-button plain size="large" class="back-btn" @click="$emit('back')">
        <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
        返回产品详情
      </el-button>
    </div>

    <!-- 当前方案切换 -->
    <div class="plan-switcher">
      <span class="switcher-label">当前方案：</span>
      <el-radio-group :model-value="plan" size="default" @change="onPlanChange">
        <el-radio-button label="all">
          <el-icon class="rb-icon"><Grid /></el-icon>全部方案
        </el-radio-button>
        <el-radio-button v-for="p in plans" :key="p.id" :label="p.id">
          <el-icon class="rb-icon"><component :is="p.icon" /></el-icon>{{ p.shortTitle }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 能力清单 -->
    <div class="capability-grid">
      <div
        v-for="cap in visibleCapabilities"
        :key="cap.id"
        class="capability-card"
      >
        <div class="capability-icon" :style="{ background: cap.tint, color: cap.color }">
          <el-icon :size="26"><component :is="cap.icon" /></el-icon>
        </div>
        <h3 class="capability-name">{{ cap.name }}</h3>
        <p class="capability-summary">{{ cap.summary }}</p>
        <ul class="capability-points">
          <li v-for="point in cap.points" :key="point">
            <el-icon><Check /></el-icon>{{ point }}
          </li>
        </ul>
      </div>
      <el-empty
        v-if="!visibleCapabilities.length"
        description="当前方案暂无可列出的数据分析能力，请切换方案后重试"
      />
    </div>

    <!-- 衔接关系矩阵 -->
    <div class="matrix-wrapper">
      <div class="matrix-title-row">
        <h3 class="matrix-title">能力与现有方案衔接关系</h3>
        <div class="status-legend">
          <span v-for="s in statusMeta" :key="s.key" class="legend-item">
            <el-icon :style="{ color: s.color }"><component :is="s.icon" /></el-icon>
            {{ s.label }}
          </span>
        </div>
      </div>

      <div class="matrix-scroll">
        <table class="linkage-matrix">
          <thead>
            <tr>
              <th class="corner-cell">数据分析能力</th>
              <th v-for="p in visiblePlans" :key="p.id" class="plan-col">
                <el-icon><component :is="p.icon" /></el-icon>
                {{ p.shortTitle }}
                <span class="plan-fullname">{{ p.title }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cap in visibleCapabilities" :key="cap.id">
              <th class="capability-cell">
                <el-icon :style="{ color: cap.color }"><component :is="cap.icon" /></el-icon>
                <span>{{ cap.name }}</span>
              </th>
              <td
                v-for="p in visiblePlans"
                :key="p.id"
                class="status-cell"
              >
                <template v-if="getLink(cap.id, p.id)">
                  <div class="cell-head">
                    <el-icon :size="16" :style="{ color: statusMeta[getLink(cap.id, p.id).status].color }">
                      <component :is="statusMeta[getLink(cap.id, p.id).status].icon" />
                    </el-icon>
                    <span class="cell-status" :class="`st-${getLink(cap.id, p.id).status}`">
                      {{ statusMeta[getLink(cap.id, p.id).status ].label }}
                    </span>
                  </div>
                  <p class="cell-detail">{{ getLink(cap.id, p.id).detail }}</p>
                  <p v-if="getLink(cap.id, p.id).source" class="cell-source">
                    数据来源：{{ getLink(cap.id, p.id).source }}
                  </p>
                </template>
                <div v-else class="cell-empty">
                  <el-icon :size="16"><CircleClose /></el-icon>
                  <span>暂无衔接数据</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 衔接情况汇总 -->
    <div class="overview-summary">
      <div
        v-for="s in statusMeta"
        :key="s.key"
        class="summary-item"
      >
        <el-icon :size="20" :style="{ color: s.color }"><component :is="s.icon" /></el-icon>
        <div>
          <div class="summary-count">{{ statusCounts[s.key] || 0 }}</div>
          <div class="summary-label">{{ s.label }}</div>
        </div>
      </div>
      <div class="summary-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>
          当前展示「{{ currentPlanName }}」{{ visibleCapabilities.length }} 项能力、
          {{ visiblePlans.length }} 套现有方案的衔接情况；缺项与不适配原因已在矩阵中标注。
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 当前对照的方案：all / wms / tms / dms
  plan: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['update:plan', 'back'])

// 现有物流方案
const plans = [
  { id: 'wms', shortTitle: '智慧仓储', title: 'WMS', icon: 'Box' },
  { id: 'tms', shortTitle: '运输管理', title: 'TMS', icon: 'Van' },
  { id: 'dms', shortTitle: '配送调度', title: 'DMS', icon: 'Location' }
]

// 衔接状态：ready 已打通 / gap 能力缺项 / empty 数据为空 / na 暂不适配
const statusMeta = {
  ready: { key: 'ready', label: '已打通', color: '#52c41a', icon: 'CircleCheck' },
  gap: { key: 'gap', label: '能力缺项', color: '#fa8c16', icon: 'WarningFilled' },
  empty: { key: 'empty', label: '数据为空', color: '#f5222d', icon: 'CircleClose' },
  na: { key: 'na', label: '暂不适配', color: '#909399', icon: 'InfoFilled' }
}

// 数据分析能力清单
const capabilities = [
  {
    id: 'report',
    name: '多维报表',
    icon: 'Document',
    color: '#1890ff',
    tint: 'rgba(24, 144, 255, 0.12)',
    summary: '运营、财务、绩效等多维度报表一键生成，支持自定义维度与定时推送。',
    points: ['库存周转 / 出入库报表', '运输成本 / 承运商账单', '配送时效 / 骑手绩效']
  },
  {
    id: 'screen',
    name: '可视化大屏',
    icon: 'Monitor',
    color: '#722ed1',
    tint: 'rgba(114, 46, 209, 0.12)',
    summary: '实时数据大屏集中呈现关键指标，支持调度中心与管理层场景投放。',
    points: ['仓储作业实时看板', '在途运输全局态势', '末端配送热力分布']
  },
  {
    id: 'alert',
    name: '智能预警',
    icon: 'Bell',
    color: '#fa8c16',
    tint: 'rgba(250, 140, 22, 0.12)',
    summary: '基于规则与阈值模型自动识别异常，多渠道推送，缩短问题响应时间。',
    points: ['库存积压 / 缺货预警', '延误 / 偏航异常预警', '超时未签收预警']
  },
  {
    id: 'trend',
    name: '趋势分析',
    icon: 'TrendCharts',
    color: '#13c2c2',
    tint: 'rgba(19, 194, 194, 0.12)',
    summary: '基于历史数据建模，识别业务规律并预测趋势，辅助提前规划资源。',
    points: ['库存需求预测', '运输成本走势分析', '订单量与运力预测']
  }
]

// 能力 × 方案 衔接关系矩阵
const linkages = [
  // 多维报表
  { capability: 'report', plan: 'wms', status: 'ready', detail: '出入库、库位、批次数据已接入，支持库存周转与作业绩效多维报表。', source: 'WMS 作业流水、库存台账' },
  { capability: 'report', plan: 'tms', status: 'ready', detail: '运单与计费数据已接入，可生成运输成本、承运商对账报表。', source: 'TMS 运单、运费结算数据' },
  { capability: 'report', plan: 'dms', status: 'gap', detail: '配送员绩效模块尚未升级，缺少人效、星级评价维度，报表能力缺项。', source: '' },
  // 可视化大屏
  { capability: 'screen', plan: 'wms', status: 'ready', detail: '仓库作业状态实时上屏，支持单仓与多仓汇总视图。', source: 'WMS + IoT 设备实时数据' },
  { capability: 'screen', plan: 'tms', status: 'empty', detail: '大屏框架已预留运输板块，但承运商定位回传尚未全量开启，当前数据为空。', source: '' },
  { capability: 'screen', plan: 'dms', status: 'ready', detail: '骑手位置与订单状态实时汇聚，支持配送态势与区域热力大屏。', source: 'DMS 骑手端实时回传' },
  // 智能预警
  { capability: 'alert', plan: 'wms', status: 'ready', detail: '库存上下限、效期与温湿度阈值预警已上线，支持短信与站内推送。', source: 'WMS 库存 + 温湿度传感' },
  { capability: 'alert', plan: 'tms', status: 'ready', detail: '偏航、超时到达、异常停留规则已配置，异常运单自动告警调度。', source: 'TMS GPS 轨迹数据' },
  { capability: 'alert', plan: 'dms', status: 'na', detail: '末端短链路配送以分钟级调度为主，运输类长时阈值预警不适配该业务场景。', source: '' },
  // 趋势分析
  { capability: 'trend', plan: 'wms', status: 'ready', detail: '基于历史出入库数据提供周转趋势与备货需求预测。', source: 'WMS 历史出入库数据' },
  { capability: 'trend', plan: 'tms', status: 'gap', detail: '预测模型需要稳定的 12 个月以上运量数据，当前样本积累不足，暂为能力缺项。', source: '' },
  { capability: 'trend', plan: 'dms', status: 'empty', detail: '订单趋势看板已部署，但新开通城市尚未产生历史订单，展示数据为空。', source: '' }
]

const visiblePlans = computed(() => {
  if (props.plan === 'all') return plans
  const p = plans.find(item => item.id === props.plan)
  return p ? [p] : plans
})

const visibleCapabilities = computed(() => capabilities)

const currentPlanName = computed(() => {
  if (props.plan === 'all') return '全部方案'
  const p = plans.find(item => item.id === props.plan)
  return p ? p.shortTitle : '全部方案'
})

const getLink = (capabilityId, planId) =>
  linkages.find(item => item.capability === capabilityId && item.plan === planId)

const statusCounts = computed(() => {
  const counts = {}
  for (const cap of visibleCapabilities.value) {
    for (const p of visiblePlans.value) {
      const link = getLink(cap.id, p.id)
      if (link) counts[link.status] = (counts[link.status] || 0) + 1
    }
  }
  return counts
})

const onPlanChange = (value) => {
  emit('update:plan', value)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.solution-overview {
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-xl;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-lg;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $border-light;
}

.overview-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  padding: 4px $spacing-sm;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;
  margin-bottom: $spacing-sm;
}

.overview-title {
  font-size: $font-size-xxl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.overview-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: $line-height-loose;
  max-width: 720px;
}

.back-btn {
  flex-shrink: 0;
}

.plan-switcher {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin: $spacing-lg 0;
  flex-wrap: wrap;

  .switcher-label {
    font-size: $font-size-sm;
    color: $text-regular;
    font-weight: 500;
  }
}

.rb-icon {
  margin-right: 4px;
  vertical-align: -2px;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
}

.capability-card {
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  transition: all 0.3s;

  &:hover {
    border-color: rgba($primary-color, 0.4);
    box-shadow: $shadow-sm;
    transform: translateY(-4px);
  }
}

.capability-icon {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
}

.capability-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.capability-summary {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: $line-height-base;
  margin-bottom: $spacing-sm;
}

.capability-points {
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-xs;
    color: $text-regular;
    line-height: $line-height-loose;

    .el-icon {
      color: $success-color;
      flex-shrink: 0;
    }
  }
}

.matrix-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.matrix-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
}

.status-legend {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-xs;
  color: $text-regular;
}

.matrix-scroll {
  overflow-x: auto;
}

.linkage-matrix {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  overflow: hidden;

  th,
  td {
    border-right: 1px solid $border-light;
    border-bottom: 1px solid $border-light;
    text-align: left;
    vertical-align: top;
  }

  th:last-child,
  td:last-child {
    border-right: none;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  thead th {
    background: $bg-color;
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: 600;
    padding: $spacing-sm $spacing-md;
  }
}

.corner-cell {
  width: 160px;
}

.plan-col {
  text-align: center !important;
  white-space: nowrap;

  .el-icon {
    vertical-align: -2px;
    margin-right: 4px;
  }

  .plan-fullname {
    color: $text-secondary;
    font-weight: 400;
    font-size: $font-size-xs;
    margin-left: 4px;
  }
}

.capability-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-sm;
  color: $text-primary;
  font-weight: 600;
  padding: $spacing-md !important;
  background: #fafbfc;
}

.status-cell {
  padding: $spacing-md;
  min-width: 220px;
}

.cell-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.cell-status {
  font-size: $font-size-sm;
  font-weight: 600;

  &.st-ready { color: $success-color; }
  &.st-gap { color: $warning-color; }
  &.st-empty { color: $danger-color; }
  &.st-na { color: $info-color; }
}

.cell-detail {
  font-size: $font-size-xs;
  color: $text-regular;
  line-height: $line-height-base;
}

.cell-source {
  font-size: $font-size-xs;
  color: $text-placeholder;
  margin-top: 6px;
}

.cell-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $text-placeholder;
  font-size: $font-size-xs;

  .el-icon {
    color: $text-placeholder;
  }
}

.overview-summary {
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  flex-wrap: wrap;
  margin-top: $spacing-lg;
  padding: $spacing-lg;
  background: $bg-color;
  border-radius: $radius-md;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .summary-count {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
  }

  .summary-label {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.summary-tip {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: $line-height-base;

  .el-icon {
    color: $primary-color;
    margin-top: 2px;
    flex-shrink: 0;
  }
}

@media (max-width: $breakpoint-lg) {
  .capability-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $breakpoint-md) {
  .solution-overview {
    padding: $spacing-md;
  }

  .overview-header {
    flex-direction: column;
  }

  .capability-grid {
    grid-template-columns: 1fr;
  }
}
</style>
