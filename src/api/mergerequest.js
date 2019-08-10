import request from '@/utils/request'

export function getAllMr(params) {
  return request({
    url: '/mergerequest/allmr',
    method: 'get',
    params
  })
}

export function approvalReview(data) {
  return request({
    url: '/mergerequest/approvalreview',
    method: 'post',
    data
  })
}

export function approvalTest(data) {
  return request({
    url: 'mergerequest/approvaltesting?pass=true',
    method: 'post',
    data
  })
}

export function rejectTest(data) {
  return request({
    url: 'mergerequest/approvaltesting?pass=false',
    method: 'post',
    data
  })
}

export function distributeTest(data) {
  return request({
    url: '/mergerequest/distributetesting',
    method: 'post',
    data
  })
}

export function distributeReview(data) {
  return request({
    url: '/mergerequest/distributereview',
    method: 'post',
    data
  })
}

export function firstReview(data) {
  return request({
    url: '/mergerequest/urgent',
    method: 'post',
    data
  })
}

export function onlinePlugin(data) {
  return request({
    url: '/mergerequest/merge',
    method: 'post',
    data
  })
}
