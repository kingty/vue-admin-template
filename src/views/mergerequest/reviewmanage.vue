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
              <el-form-item class="detail" label="Offline Time" v-if="scope.row.is_ab">
                <span>{{ scope.row.offline_time | parseTime }}</span>
              </el-form-item>
              <el-form-item class="detail" label="MRLink">
                <span>
                  <el-link
                    :href="scope.row.web_url"
                    target="_blank"
                    type="primary"
                  >{{scope.row.web_url}}</el-link>
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
              effect="plain"
            >First</el-tag>
            <el-tag
              v-if="scope.row.is_ab"
              key="A/B"
              type="success"
              size="small"
              effect="plain"
            >A/B</el-tag>
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
        <el-table-column label width="200" align="right">
          <template slot-scope="scope">
            <el-button
              size="small"
              v-if="scope.row.local_state === 3 || scope.row.local_state === 4 || scope.row.local_state === 5"
              type="primary"
              @click="distributedialoglVisible = true ; selectedRow = scope.row; firstReviewr='' ; merger = ''"
            >distribute</el-button>
            <el-button
              size="small"
              v-if="scope.row.local_state === 3 || scope.row.local_state === 4 || scope.row.local_state === 5"
              type="success"
              @click="firstdialoglVisible = true ; selectedRow = scope.row; "
            >first</el-button>
            <el-tag
              v-if="scope.row.local_state === 6"
              key="online"
              type="info"
              size="small"
              effect="dark"
            >online</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog
      title="Select Tester"
      :visible.sync="distributedialoglVisible"
      width="40%"
    >
      Select tester for mr {{selectedRow.iid}}
      <br />
      <br />
      <span>
        <strong>Rviewer:</strong>
        <el-select v-model="firstReviewr" clearable filterable placeholder="请选择">
          <el-option v-for="item in reviewrs" :key="item" :label="item" :value="item"></el-option>
        </el-select>

        <strong>Merger:</strong>
        <el-select v-model="merger" clearable filterable placeholder="请选择">
          <el-option v-for="item in mergers" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </span>

      <span slot="footer" class="dialog-footer">
        <el-button @click="distributedialoglVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          @click="distributedialoglVisible = false; distribute(selectedRow)"
        >Yes</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Confirm"
      :visible.sync="firstdialoglVisible"
      width="30%"
    >
      <span>Make or remove mr {{selectedRow.iid}} review first?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="firstdialoglVisible = false">Cancel</el-button>
        <el-button type="success" @click="firstdialoglVisible = false; firstReview(selectedRow)">Yes</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllMr, distributeReview, firstReview } from "@/api/mergerequest";
import { parseTime, statusFilter } from "@/utils";
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["name", "roles"])
  },
  data() {
    return {
      postData: {
        mr_id: "",
        reviewer: "",
        merge_reviewer: ""
      },
      postDataUrgent: {
        mr_id: "",
        urgent: ""
      },
      with: {
        with: "reviewer"
      },
      selectedRow: "",
      distributedialoglVisible: false,
      firstdialoglVisible: false,
      firstReviewr: "",
      merger: "",
      reviewrs: [],
      mergers: [],
      search: "",
      type: "",
      state: "",
      list: [],
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
    success() {
      this.$notify({
        title: "Success",
        message: "Modify Success",
        type: "success"
      });
    },
    firstReview(row) {
      this.postDataUrgent.mr_id = row.iid;
      this.postDataUrgent.urgent = row.urgent === 0 ? 1 : 0;
      firstReview(this.postDataUrgent).then(response => {
        row.urgent = this.postDataUrgent.urgent;
        this.success();
      });
    },
    distribute(row) {
      this.postData.mr_id = row.iid;
      this.postData.reviewer = this.firstReviewr;
      this.postData.merge_reviewer = this.merger;
      distributeReview(this.postData).then(response => {
        if (row.local_state !== 5) {
          row.local_state = 4;
          row.reviewer = this.postData.reviewer;
          row.merge_reviewer = this.postData.merge_reviewer;
        } else {
          row.merge_reviewer = this.postData.merge_reviewer;
        }

        this.success();
      });
    },
    fetchData() {
      this.listLoading = true;
      getAllMr(this.with).then(response => {
        this.reviewrs = response.reviewers;
        this.mergers = response.merge_reviewers;
        this.list = response.mrs.filter(item => {
          return item.local_state > 2;
        });
        this.listLoading = false;
      });
    }
  }
};
</script>
