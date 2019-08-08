// import parseTime, formatTime and set to filter
export { parseTime, formatTime } from '@/utils'

export function statusFilter (mr) {
  var statusMap = {
    0: 'defalut',
    1: 'R-test',
    2: 'test',
    3: 'R-review',
    4: 'review',
    5: 'R-approval'
  }

  const state = mr.local_state


  const value = statusMap[state]
  console.log(value)
  statusMap[state] = styleStatus(value)
  return statusMap
}

function styleStatus (s) {
  return {
    style: {
      color: '#1989FA'
    },
    label:  s 
  }
}
