<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="grid-content bg-purple"></div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple"></div>
      </el-col>
      <el-col :span="3" justify="end">
        <div class="grid-content bg-purple"></div>
      </el-col>
      <el-col :span="3" justify="end">
        <div class="grid-content bg-purple"></div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple">
          <el-input placeholder="search" prefix-icon="el-icon-search" v-model="search"></el-input>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-table
        v-loading="listLoading"
        :data="list.filter(data => (!search 
        || data.mr_id.toString().includes(search.toLowerCase()) 
        || data.owner.toString().includes(search.toLowerCase())) && data.is_ab
        )"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="MRID" width="200">
          <template slot-scope="scope">
            <el-link :href="scope.row.web_url" target="_blank" type="primary">{{scope.row.mr_id}}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="Author" width="200" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.owner }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Offline Time" width="200">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row.offline_time| parseTime }}
          </template>
        </el-table-column>

        <el-table-column label="Progress" align="center">
          <template slot-scope="scope" height="100">
            <el-slider v-model="scope.row.state" :marks="scope.row | statusFilter" :max="6"></el-slider>
          </template>
        </el-table-column>
        <el-table-column label width="250" align="center">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="primary"
              @click="requestdialogVisible = true; selectRow = scope.row; form.is_ab = true; form.offline_time = scope.row.offline_time"
            >change</el-button>
            <el-button
              size="small"
              type="danger"
              @click="offlinedialogVisible = true; selectRow = scope.row"
            >offline</el-button>
            <el-button
              size="small"
              type="success"
              @click="logdialogVisible = true; selectRow = scope.row;logs = []; fetchLogs(scope.row.mr_id) "
            >log</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="Confirm" :visible.sync="offlinedialogVisible" width="30%">
      <span>Sure for Offline mr {{selectRow.iid}} ?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="offlinedialogVisible = false">Cancel</el-button>
        <el-button type="danger" @click="offlinedialogVisible = false; offline(selectRow)">Yes</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Make sure some information" :visible.sync="requestdialogVisible" width="40%">
      <el-form ref="form" :model="form" label-width="150px">
        <el-form-item label="Is A/B Test">
          <el-switch v-model="form.is_ab" />
        </el-form-item>
        <el-form-item v-if="form.is_ab" label="A/B Offline In Plan">
          <el-col :span="12">
            <el-date-picker
              v-model="form.offline_time"
              type="date"
              placeholder="Pick a date"
              style="width: 100%;"
            />
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="requestdialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="requestdialogVisible = false; request(selectRow)">Yes</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Logs " :visible.sync="logdialogVisible" width="40%">
      <el-table
        v-loading="logsLoading"
        :data="logs"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="Actor" width="100">
          <template slot-scope="scope">{{scope.row.actor}}</template>
        </el-table-column>
        <el-table-column label="Action" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.action }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Time" width="200">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row.time}}
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button @click="logdialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="logdialogVisible = false">Yes</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getABMr, changeABInfo, logsForMr, offlineAb } from "@/api/mergerequest";
import { parseTime, statusFilter } from "@/utils";
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["name", "roles"])
  },
  data() {
    return {
      params: {
        mr_id: ""
      },
      form: {
        is_ab: false,
        offline_time: ""
      },
      postData: {
        mr_id: "",
        is_ab: 0,
        offline_time: ""
      },
      selectRow: "",
      requestdialogVisible: false,
      logdialogVisible: false,
      offlinedialogVisible: false,
      search: "",
      list: [],
      logs: [],
      listLoading: true,
      logsLoading: true
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    success() {
      this.$notify({
        title: "Success",
        message: "Modify Success",
        type: "success"
      });
    },
    offline(row) {
      this.params.mr_id = row.mr_id;
      offlineAb(this.params).then(response => {
        row.is_ab = this.postData.is_ab;
        row.offline_time = this.postData.offline_time;
        this.success();
      });
    },
    request(row) {
      if (this.form.is_ab && !this.form.offline_time) {
        this.$notify.error({
          title: "Forbiden",
          message: "Please Pick a Offline Time"
        });
      } else {
        this.postData.mr_id = row.mr_id;
        this.postData.offline_time = this.form.offline_time;
        if (this.form.is_ab) {
          this.postData.is_ab = 1;
        } else {
          this.postData.is_ab = 0;
        }

        changeABInfo(this.postData).then(response => {
          row.is_ab = this.postData.is_ab;
          row.offline_time = this.postData.offline_time;
          this.success();
        });
      }
    },
    fetchData() {
      this.listLoading = true;
      getABMr().then(response => {
        this.list = response.local_mrs;
        this.listLoading = false;
      });
    },
    fetchLogs(mr_id) {
      this.logsLoading = true;
      this.params.mr_id = mr_id;
      logsForMr(this.params).then(response => {
        this.logs = response.logs;
        this.logsLoading = false;
      });
    }
  }
};
</script>
