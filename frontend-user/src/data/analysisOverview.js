/**
 * 数据分析服务 —— 方案概览数据
 *
 * 说明：
 * - capabilities：数据分析平台提供的四类能力（多维报表 / 可视化大屏 / 智能预警 / 趋势分析）。
 * - businessSolutions：现有已交付的业务方案（仓储 WMS / 运输 TMS / 配送 DMS），概览始终与当前所选方案对应。
 * - capabilityMatrix：能力 × 现有方案的衔接矩阵，每个单元格描述衔接状态、已覆盖指标与缺项原因。
 *
 * 衔接状态 status 取值：
 * - ready   已适配：能力已与该方案打通，可直接使用
 * - partial 部分适配：部分能力/数据源已接入，尚有缺项
 * - gap     能力缺项：当前方案暂不具备该分析能力
 * - empty   数据为空：技术上已支持，但当前业务暂无有效数据，暂不开放使用
 * - na      暂不适配：该能力与当前业务场景不匹配
 */

// 状态元数据：标签、图标、文案颜色
export const CAPABILITY_STATUS = {
  ready: {
    key: 'ready',
    label: '已适配',
    icon: 'CircleCheckFilled',
    color: '#52c41a',
    alertType: 'success'
  },
  partial: {
    key: 'partial',
    label: '部分适配',
    icon: 'WarningFilled',
    color: '#fa8c16',
    alertType: 'warning'
  },
  gap: {
    key: 'gap',
    label: '能力缺项',
    icon: 'CircleCloseFilled',
    color: '#f5222d',
    alertType: 'error'
  },
  empty: {
    key: 'empty',
    label: '数据为空',
    icon: 'DocumentRemove',
    color: '#909399',
    alertType: 'info'
  },
  na: {
    key: 'na',
    label: '暂不适配',
    icon: 'QuestionFilled',
    color: '#8c8c8c',
    alertType: 'info'
  }
}

// 数据分析平台能力清单
export const capabilities = [
  {
    id: 'report',
    name: '多维报表',
    icon: 'Document',
    desc: '围绕运营、财务、绩效等主题，按组织、时间、业务对象等多维度灵活分析，报表一键生成、定时推送。',
    highlights: ['运营/财务/绩效主题', '多维交叉分析', '定时订阅推送']
  },
  {
    id: 'screen',
    name: '可视化大屏',
    icon: 'Monitor',
    desc: '实时数据大屏，将作业量、库存、运力、时效等核心指标可视化呈现，支持指挥中心与管理层一屏总览。',
    highlights: ['秒级实时刷新', '指挥中心大屏', '核心指标总览']
  },
  {
    id: 'alert',
    name: '智能预警',
    icon: 'BellFilled',
    desc: '基于阈值规则与异常检测模型，对库存、时效、成本等指标异常自动预警，消息实时推送至责任人。',
    highlights: ['阈值+模型双引擎', '异常自动推送', '闭环处置跟踪']
  },
  {
    id: 'trend',
    name: '趋势分析',
    icon: 'TrendCharts',
    desc: '基于历史数据进行趋势建模与预测，输出周期走势、季节性规律与需求预测，辅助提前调度与备货。',
    highlights: ['历史趋势建模', '业务量预测', '季节性洞察']
  }
]

// 现有业务方案（数据分析服务所衔接的对象）
export const businessSolutions = [
  {
    id: 'wms',
    name: '智慧仓储方案',
    shortName: '仓储',
    productName: '智慧仓储管理系统 (WMS)',
    icon: 'Box',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    desc: '多仓库、多货主的仓内作业与库存管理方案，是数据分析平台库存类指标的主要数据来源。',
    dataSources: ['入库单/出库单流水', '实时库存与库位数据', '拣货/盘点作业记录', '批次与效期台账']
  },
  {
    id: 'tms',
    name: '运输方案',
    shortName: '运输',
    productName: '运输管理系统 (TMS)',
    icon: 'Van',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    desc: '运力调度、运单跟踪与运费核算方案，为数据分析平台提供运输时效、成本与轨迹类数据。',
    dataSources: ['运单与调度记录', 'GPS 轨迹与状态', '运费结算账单', '承运商考核数据']
  },
  {
    id: 'dms',
    name: '配送方案',
    shortName: '配送',
    productName: '配送调度系统 (DMS)',
    icon: 'Location',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    desc: '末端订单分配、骑手调度与电子签收方案，为数据分析平台提供妥投时效与末端服务类数据。',
    dataSources: ['配送订单与派单记录', '骑手实时位置', '电子签收与异常凭证', '妥投/拒收结果']
  }
]

/**
 * 能力 × 方案衔接矩阵
 * 结构：{ [solutionId]: { [capabilityId]: cell } }
 * cell 字段：
 * - status：衔接状态（见 CAPABILITY_STATUS）
 * - summary：一句话说明衔接情况（用于卡片/矩阵概览）
 * - metrics：已覆盖的指标（ready/partial 时展示）
 * - reason：能力缺项、数据为空或不适配的具体原因（非 ready 时展示）
 * - action：建议的补齐/开放方式
 */
export const capabilityMatrix = {
  wms: {
    report: {
      status: 'ready',
      summary: '库存、出入库、作业绩效报表已全部上线',
      metrics: ['库存周转率', '出入库吞吐量', '拣货人效', '库存准确率 99.9%'],
      reason: '',
      action: ''
    },
    screen: {
      status: 'ready',
      summary: '仓储实时大屏已上线，数据秒级刷新',
      metrics: ['实时库存量', '当日出入库单量', '库容利用率', '异常作业告警数'],
      reason: '',
      action: ''
    },
    alert: {
      status: 'ready',
      summary: '库存与效期预警规则已配置并运行',
      metrics: ['安全库存预警', '库龄超期预警', '效期临期预警'],
      reason: '',
      action: ''
    },
    trend: {
      status: 'ready',
      summary: '基于 12 个月历史数据提供库存与吞吐预测',
      metrics: ['库存水位预测', '出入库季节性走势', '库容需求预测'],
      reason: '',
      action: ''
    }
  },

  tms: {
    report: {
      status: 'ready',
      summary: '运量、时效、运费报表已上线',
      metrics: ['发运量', '准时到达率', '单位运费', '承运商排名'],
      reason: '',
      action: ''
    },
    screen: {
      status: 'partial',
      summary: '大屏框架已上线，仅接入自有车辆 GPS，外协车辆轨迹尚未接入',
      metrics: ['自有车辆实时位置', '当日发运量', '在途异常数'],
      reason: '外协承运商车辆占比约 45%，其定位接口协议未统一，轨迹数据无法回传，导致大屏车辆总览与全网在途指标不完整。',
      action: '通过标准 API 接入外协承运商轨迹平台（预计 2~3 周），接入后自动补齐全网车辆总览。'
    },
    alert: {
      status: 'ready',
      summary: '运输异常与时效预警已上线',
      metrics: ['超速/偏航预警', '超时未到达预警', '异常滞留预警'],
      reason: '',
      action: ''
    },
    trend: {
      status: 'empty',
      summary: '趋势模型已内置，但缺少历史运单数据，暂不开放',
      metrics: [],
      reason: 'TMS 于 3 个月前上线，历史运单尚未从旧系统迁移，可用历史数据不足 6 个月，无法满足趋势预测模型最低 12 个月的样本要求，当前预测结果不具备参考价值。',
      action: '完成历史运单迁移并持续积累数据，样本达标后自动开放运输量与成本趋势预测。'
    }
  },

  dms: {
    report: {
      status: 'partial',
      summary: '配送时效报表可用，骑手成本与绩效报表暂缺',
      metrics: ['妥投率', '平均配送时长', '准时率'],
      reason: '骑手计酬规则在各城市不一致且尚未线上化，薪酬数据未回传 DMS，导致骑手成本、人均单量等绩效类报表无法计算。',
      action: '先在试点城市统一并线上化计酬规则，再补齐骑手成本与绩效报表。'
    },
    screen: {
      status: 'gap',
      summary: '当前 DMS 版本未提供实时数据推送能力',
      metrics: [],
      reason: '现网运行的 DMS 为早期版本，仅支持订单状态定时轮询，不具备秒级数据推送能力，无法支撑实时大屏；升级到支持事件推送的新版本前，该能力无法提供。',
      action: '将 DMS 升级至支持实时事件推送的版本，并开通骑手定位实时上报后建设配送大屏。'
    },
    alert: {
      status: 'ready',
      summary: '配送超时与异常订单预警已上线',
      metrics: ['超时未配送预警', '异常拒收预警', '骑手离线预警'],
      reason: '',
      action: ''
    },
    trend: {
      status: 'na',
      summary: '趋势预测与当前业务模式不匹配，暂不启用',
      metrics: [],
      reason: '当前末端配送为即时订单、当日清模式，订单由上游平台实时派发，不存在提前备货/排班预测场景；引入业务量趋势预测不会改善现有调度决策，与当前业务不适配。',
      action: '如未来拓展预约单、次日达等计划性配送业务，再按需启用趋势分析能力。'
    }
  }
}

// 合法方案 ID 列表（路由 query 校验用）
export const SOLUTION_IDS = businessSolutions.map(item => item.id)

// 当前方案在概览中持久化使用的 sessionStorage 键
export const ACTIVE_SOLUTION_STORAGE_KEY = 'dataAnalysisOverview:activeSolution'

export const getSolutionById = (id) => businessSolutions.find(item => item.id === id)

export const getCapabilityById = (id) => capabilities.find(item => item.id === id)

// 获取某方案下某能力的衔接信息，缺省返回空占位
export const getMatrixCell = (solutionId, capabilityId) => {
  return capabilityMatrix[solutionId]?.[capabilityId] || null
}

// 某方案的衔接统计：各状态数量
export const getSolutionStats = (solutionId) => {
  const stats = { ready: 0, partial: 0, gap: 0, empty: 0, na: 0, total: capabilities.length }
  capabilities.forEach(capability => {
    const cell = getMatrixCell(solutionId, capability.id)
    if (cell && stats[cell.status] !== undefined) {
      stats[cell.status] += 1
    }
  })
  return stats
}
