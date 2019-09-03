<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="grid-content bg-purple">
          <el-tag type="info">
            共
            <strong>{{list.length}}</strong> 条
          </el-tag>
        </div>
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
        || data.tester.toString().includes(search.toLowerCase())
        || data.reviewer.toString().includes(search.toLowerCase())
        || data.merge_reviewer.toString().includes(search.toLowerCase())
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
        <el-table-column label="MRID" min-width="10%">
          <template slot-scope="scope">
            {{ scope.row.iid }}
            <el-tag
              v-if="scope.row.urgent === 1"
              key="First"
              type="danger"
              size="small"
              effect="plain"
            >First</el-tag>
            <el-tag v-if="scope.row.is_ab" key="A/B" type="success" size="small" effect="plain">A/B</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Author" min-width="10%" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.author.username }}</span>
          </template>
        </el-table-column>
        <el-table-column label="MRTitle" min-width="15%">
          <template slot-scope="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="TargetBranch" min-width="10%" align="center">
          <template slot-scope="scope">{{ scope.row.target_branch }}</template>
        </el-table-column>
        <el-table-column label="Progress" align="center" min-width="45%">
          <template slot-scope="scope" height="100">
            <el-slider v-model="scope.row.local_state" :marks="scope.row | statusFilter" :max="6"></el-slider>
          </template>
        </el-table-column>
        <el-table-column label="Build" align="center" min-width="10%">
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.project_id === 284"
              @click="toBuild(scope.row)"
              target="_blank"
              type="primary"
            >Build Task</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>

<script>
import { getAllMr } from "@/api/mergerequest";
import { parseTime, statusFilter, mr2BuildData } from "@/utils";

export default {
  data() {
    return {
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
    toBuild(selectRow) {
      const buildData = mr2BuildData(selectRow, false);
      this.$store
        .dispatch("mr/buildData", buildData)
        .then(() => {
          this.$router.push({
            path: "/build"
          });
        })
        .catch(() => {});
    },
    fetchData() {
      this.listLoading = true;
      getAllMr().then(response => {
        this.list = response.mrs;
        this.listLoading = false;
      });
    }
  }
};
</script>
