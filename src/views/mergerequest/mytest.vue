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
        <div class="grid-content bg-purple">
          <el-select v-model="type" clearable placeholder="type">
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </el-col>
      <el-col :span="3" justify="end">
        <div class="grid-content bg-purple">
          <el-select v-model="state" clearable placeholder="progress">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
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
        || data.title.toLowerCase().includes(search.toLowerCase()) 
        || data.iid.toString().includes(search.toLowerCase())
        || data.author.username.toLowerCase().includes(search.toLowerCase()))
        && (!type || data.project_id===type)
        && (!state || data.local_state===state)
        )"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item class="detail" label="MRLink">
                <span>
                  <el-link :href="scope.row.web_url" type="primary">{{scope.row.web_url}}</el-link>
                </span>
              </el-form-item>
              <el-form-item class="detail" label="Description">
                <span>{{ scope.row.description }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="MRID" width="120">
          <template slot-scope="scope">
            {{ scope.row.iid }}
            <el-tag
              v-if="scope.row.urgent === 1"
              key="First"
              type="danger"
              size="small"
              effect="dark"
            >First</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Author" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.author.username }}</span>
          </template>
        </el-table-column>
        <el-table-column label="MRTitle" width="300">
          <template slot-scope="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="TargetBranch" width="150" align="center">
          <template slot-scope="scope">{{ scope.row.target_branch }}</template>
        </el-table-column>
        <el-table-column label="Progress" align="center">
          <template slot-scope="scope" height="100">
            <el-slider v-model="scope.row.local_state" :marks="scope.row | statusFilter" :max="6"></el-slider>
          </template>
        </el-table-column>
        <el-table-column label width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="small"
              v-if="scope.row.local_state === 2"
              type="primary"
              @click="approvadialoglVisible = true ;mrid=scope.row.iid"
            >approval</el-button>
            <el-button
              size="small"
              v-if="scope.row.local_state === 2"
              type="danger"
              @click="rejectdialogVisible = true ;mrid=scope.row.iid"
            >reject</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog
      title="Confirm"
      :visible.sync="approvadialoglVisible"
      width="30%"
      :before-close="handleClose"
    >
      <span>Approval test for mr {{mrid}} ?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="approvadialoglVisible = false">Cancel</el-button>
        <el-button type="primary" @click="approvadialoglVisible = false">Yes</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Confirm"
      :visible.sync="rejectdialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <span>Sure for Reject mr {{mrid}} ?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectdialogVisible = false">Cancel</el-button>
        <el-button type="danger" @click="rejectdialogVisible = false">Yes</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllMr } from "@/api/mergerequest";
import { parseTime, statusFilter } from "@/utils";
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["name", "roles"])
  },
  data() {
    return {
      mrid: "",
      approvadialoglVisible: false,
      rejectdialogVisible: false,
      search: "",
      type: "",
      state: "",
      list: null,
      listLoading: true,
      types: [
        {
          value: 379,
          label: "plugin"
        },
        {
          value: 284,
          label: "normal"
        }
      ],
      status: [
        {
          value: 0,
          label: "Default"
        },
        {
          value: 1,
          label: "RequestTest"
        },
        {
          value: 2,
          label: "Testing"
        },
        {
          value: 3,
          label: "RequestReview"
        },
        {
          value: 4,
          label: "Reviewing"
        },
        {
          value: 5,
          label: "ReviewApproval"
        },
        {
          value: 6,
          label: "Merged"
        }
      ]
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getAllMr().then(response => {
        this.list = response.mrs.filter(item => {
          return item.tester.includes("jiashidi");
        });
        this.listLoading = false;
      });
    }
  }
};
</script>
