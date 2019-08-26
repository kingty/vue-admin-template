
const state = {
  buildData: ''
}

const mutations = {
  SET_BUILDDATA: (state, buildData) => {
    state.buildData = buildData
  }
}


const actions = {
  buildData({ commit } ,buildData) {
    return new Promise((resolve, reject) => {
      commit('SET_BUILDDATA', buildData)
      resolve()
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

