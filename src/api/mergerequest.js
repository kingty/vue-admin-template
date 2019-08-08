import request from '@/utils/request'

export function getAllMr(params) {
  return request({
    url: '/mergerequest/allmr',
    method: 'get',
    params
  })
}
