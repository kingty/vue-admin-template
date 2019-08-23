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

    <el-row :gutter="20" justify="end">
      <el-button type="success" @click="debugDialoglVisible = true;">Build Debug</el-button>
      <el-button type="danger" @click="dexguardDialoglVisible = true;">Build Dexguard</el-button>
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
        <el-table-column label="Sha" min-width="30%" align="center">
          <template slot-scope="scope">{{ scope.row.sha }}</template>
        </el-table-column>
        <el-table-column label="StartTime" min-width="20%" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row.start_time | parseTime }}
          </template>
        </el-table-column>
        <el-table-column label="State" min-width="10%" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state === 0" key="building" size="small" effect="plain">building</el-tag>

            <el-tag
              v-if="scope.row.state === 1"
              key="success"
              type="success"
              size="small"
              effect="dark"
            >success</el-tag>
            <el-tag
              v-if="scope.row.state === 2"
              key="failed"
              type="danger"
              size="small"
              effect="dark"
            >failed</el-tag>
            <el-tag
              v-if="scope.row.state === 3"
              key="timeout"
              type="warning"
              size="small"
              effect="dark"
            >timeout</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Builder" min-width="10%" align="center">
          <template slot-scope="scope">{{ scope.row.builder }}</template>
        </el-table-column>
        <el-table-column label="ApkPath" min-width="30%" align="center">
          <template slot-scope="scope">{{ scope.row.uuid }}</template>
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
import { getAllBuildByMr, buildDebug, buildDexguard } from "@/api/build";
import { parseTime, statusFilter } from "@/utils";

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
    debug() {
      buildDebug(this.buildData).then(response => {
        this.list.push(response);
      });
    },
    dexguard() {
      buildDexguard(this.buildData).then(response => {
        this.list.push(response);
      });
    },
    fetchData(mr_id) {
      this.fresh = false;
      this.listLoading = true;
      this.param.mr_id = mr_id;
      getAllBuildByMr(this.param).then(response => {
        this.list = response.builds;
        this.listLoading = false;
      });
    }
  }
};
</script>
