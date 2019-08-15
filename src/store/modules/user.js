import { login, getInfo, signup } from '@/api/user'
import { getToken, setToken, removeToken, setName, getName, removeName } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: getName(),
  avatar: '',
  roles: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        commit('SET_TOKEN', response.token)
        setToken(response.token)
        commit('SET_NAME', response.name)
        setName(response.name)
        resolve()
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },
  signup({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      signup({ username: username.trim(), password: password }).then(response => {
        resolve()
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const { role } = response
        commit('SET_ROLES', role)
        resolve(role)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_ROLES', '')
      removeToken()
      removeName()
      resetRouter()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_ROLES', '')
      removeToken()
      removeName()
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

