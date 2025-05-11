import request from '../http/request.js'

// 获取所有建筑物信息
export function getAllBuildings() {
  return request({
    url: '/buildings',
    method: 'get'
  })
}

// 获取特定建筑物的信息
export function getBuildingInfo(buildingId) {
  return request({
    url: `/buildings/${buildingId}`,
    method: 'get'
  })
}

// 获取特定建筑物的电力消耗数据
export function getBuildingElectricityConsumption(buildingId) {
  return request({
    url: `/electricity_consumption?building_id=${buildingId}`,
    method: 'get'
  })
}

// 获取特定建筑物的水资源消耗数据
export function getBuildingWaterConsumption(buildingId) {
  return request({
    url: `/water_consumption?building_id=${buildingId}`,
    method: 'get'
  })
}

// 获取所有建筑物的电力消耗总览
export function getAllElectricityConsumption() {
  return request({
    url: '/electricity_consumption',
    method: 'get'
  })
}

// 获取所有建筑物的水资源消耗总览
export function getAllWaterConsumption() {
  return request({
    url: '/water_consumption',
    method: 'get'
  })
}