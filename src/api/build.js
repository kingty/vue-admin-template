import request from '@/utils/request'


export function getAllBuildByMr(params) {
  return request({
    url: '/build/buildsbymr',
    method: 'get',
    params
  })
}

export function getMrById(params) {
  return request({
    url: '/build/latestcommitbymr',
    method: 'get',
    params
  })
}

export function buildDebug(data) {
  return request({
    url: 'build/build?type=debug',
    method: 'post',
    data
  })
}

export function buildDexguard(data) {
  return request({
    url: 'build/build?type=dexguard',
    method: 'post',
    data
  })
}


export function getBuildTask(params) {
  return request({
    url: 'build/getbuildtask',
    method: 'get',
    params
  })
}
