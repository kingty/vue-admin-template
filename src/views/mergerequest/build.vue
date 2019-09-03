<template>
  <div class="app-container">
    <el-row :gutter="20"></el-row>
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="grid-content bg-purple">
          <strong>MrId :</strong>
          {{buildData.mrid}}
        </div>
      </el-col>
      <el-col :span="4">
        <div class="grid-content bg-purple">
          <strong>MrTitle :</strong>
          {{buildData.mrtitle}}
        </div>
      </el-col>
      <el-col :span="4">
        <div class="grid-content bg-purple">
          <strong>Owner :</strong>
          {{buildData.mrowner}}
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content bg-purple">
          <strong>Latest Hash :</strong>
          {{buildData.mrhash}}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20"></el-row>

    <el-row :gutter="20" justify="end" >
      <el-button type="success" v-if="buildData.hasbutton" @click="debugDialoglVisible = true;">Build Debug</el-button>
      <el-button type="danger" v-if="buildData.hasbutton" @click="dexguardDialoglVisible = true;">Build Dexguard</el-button>
      <el-button
        type="primary"
        @click="fresh = true;fetchData(buildData.mrid)"
        :loading="fresh"
      >Fresh Build History</el-button>
    </el-row>

    <el-row :gutter="20">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="State" min-width="15%" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.state === 0 && !timeout(scope.row.start_time, scope.row.build_type===0)"
              key="building"
              size="small"
              effect="plain"
            >building</el-tag>

            <el-tag
              v-if="scope.row.state === 1"
              key="success"
              type="success"
              size="small"
              effect="plain"
            >success</el-tag>
            <el-tag
              v-if="scope.row.state === 2"
              key="failed"
              type="danger"
              size="small"
              effect="plain"
            >failed</el-tag>
            <el-tag
              v-if="scope.row.state === 3 || (timeout(scope.row.start_time, scope.row.build_type===0) && scope.row.state === 0)"
              key="timeout"
              type="warning"
              size="small"
              effect="plain"
            >timeout</el-tag>

            <el-tag
              v-if="scope.row.build_type === 1 "
              key="type"
              type="danger"
              size="small"
              effect="plain"
            >dexgurad</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="StartTime" min-width="15%" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row.start_time | parseTime }}
          </template>
        </el-table-column>

        <el-table-column label="Builder" min-width="10%" align="center">
          <template slot-scope="scope">{{ scope.row.builder }}</template>
        </el-table-column>
        <el-table-column label="Last Commit" min-width="30%" align="center">
          <template slot-scope="scope">{{ scope.row.sha }}</template>
        </el-table-column>
        <el-table-column label="Log" min-width="10%" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.build_number===0" size= "mini" type="success" @click="refreshBuildTask(scope.row)">fresh</el-button>
            <el-link
              v-if="scope.row.build_number!==0"
              :href=" scope.row.build_url.replace('https://jenkins-android.p1staff.com/','http://apk.p1staff.com/') + '/consoleFull'"
              target="_blank"
              type="primary"
            >{{scope.row.build_number}}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="Apk" min-width="20%" align="center">
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.state === 1"
              :href=" 'http://apk.p1staff.com/tantan/' + scope.row.apk_path"
              target="_blank"
              type="primary"
            >Local</el-link>
            <span v-if="scope.row.state === 1">-</span>
            <el-link
              v-if="scope.row.state === 1"
              :href=" 'http://apk.p1staff.com/tantan/' + scope.row.apk_path.replace('.apk', '-intl.apk')"
              target="_blank"
              type="primary"
            >Intl</el-link>
            <span v-if="scope.row.state === 1">-</span>
            <el-link
              v-if="scope.row.state === 1"
              :href=" 'http://apk.p1staff.com/tantan/' + getdir(scope.row.apk_path)"
              target="_blank"
              type="primary"
            >Dir</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="Confirm" :visible.sync="debugDialoglVisible" width="30%">
      <span>Build a debug apk for mr {{buildData.mrid}} ?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="debugDialoglVisible = false">Cancel</el-button>
        <el-button type="primary" @click="debugDialoglVisible = false; debug()">Yes</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Confirm" :visible.sync="dexguardDialoglVisible" width="30%">
      <span>Build a dexguard apk for mr {{buildData.mrid}} ?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dexguardDialoglVisible = false">Cancel</el-button>
        <el-button type="danger" @click="dexguardDialoglVisible = false; dexguard()">Yes</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllBuildByMr, buildDebug, buildDexguard, getBuildTask, getMrById } from "@/api/build";
import { mr2BuildData, parseTime, statusFilter } from "@/utils";

import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["buildData"])
  },
  data() {
    return {
      param: {
        mr_id: ""
      },
      taskParam: {
        uuid: ""
      },
      list: [],
      listLoading: true,
      fresh: true,
      debugDialoglVisible: false,
      dexguardDialoglVisible: false
    };
  },
  created() {
    if (!this.buildData) {
      this.$router.push({ path: "/" });
    } else {
      this.fetchData(this.buildData.mrid);
    }
  },
  methods: {
    refreshMr(mr_id) {
      this.param.mr_id = mr_id;
      getMrById(this.param).then(mr => {
        const newData = mr2BuildData(mr, this.buildData.hasbutton);

        this.$store
          .dispatch("mr/buildData", newData)
          .then(() => {
            console.log("get mr success")
          })
          .catch(() => {});
      });

    },
    refreshBuildTask(row) {
      this.taskParam.uuid=row.uuid
      console.log(this.taskParam)
      getBuildTask(this.taskParam).then(response => {
        row.build_number = response.build_number;
        row.build_url = response.build_url;
      });
    },
    debug() {
      buildDebug(this.buildData).then(response => {
        this.list.unshift(response);
      });
    },
    dexguard() {
      buildDexguard(this.buildData).then(response => {
        this.list.unshift(response);
      });
    },
    fetchData(mr_id) {
      this.refreshMr(mr_id)
      this.fresh = false;
      this.listLoading = true;
      this.param.mr_id = mr_id;
      getAllBuildByMr(this.param).then(response => {
        this.list = response.builds;
        this.listLoading = false;
      });
    },
    timeout(time, debug) {
      let date;
      if (typeof time === "object") {
        date = time;
      } else {
        if (typeof time === "string" && /^[0-9]+$/.test(time)) {
          time = parseInt(time);
        }
        if (typeof time === "number" && time.toString().length === 10) {
          time = time * 1000;
        }
        date = new Date(time);
      }
      const now = Date.now();

      const diff = (now - date) / 1000;

      if (diff > 3600 && debug) {
        //debug 1h time out
        return true;
      }
      if (!debug && diff > 8 * 3600) {
        // dexguard 8h time out
        return true;
      }
      return false;
    },
    getdir(path) {
      var obj = path.lastIndexOf("/");
      return path.substr(0, obj);
    }
  }
};
</script>
