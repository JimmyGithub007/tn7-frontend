"use client"

import Shell from "@/components/Shell"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, FormGroup, CircularProgress, Typography, Divider, MenuItem, Drawer, List, ListItem, ListItemText, ListItemButton } from "@mui/material"
import { MdAdd, MdEdit, MdDelete } from "react-icons/md"
import CustomTable, { Column } from "@/components/(widgets)/CustomTable"
import { useSnackbar } from 'notistack';
import { setJumpPage } from "@/store/slice/pageSlice"
import { useDispatch } from "react-redux"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
  headers: { Accept: "application/json" }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("cms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

const RolePage = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningUsers, setAssigningUsers] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: number, name: string }[]>([]);

  // 拉取权限和角色
  const fetchData = async () => {
    setLoading(true);
    try {
      const [permRes, roleRes] = await Promise.all([
        api.get("/permissions"),
        api.get("/roles")
      ]);
      setPermissions(permRes.data);
      setRoles(roleRes.data);
    } catch (e) {
      console.log(e);
      alert("Failed to load data. Please check your login status or API service.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 拉取所有用户
  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/users");
      setAllUsers(res.data);
    } catch (e) {
      alert("Failed to load users");
    }
  };

  // 打开新增/编辑弹窗
  const handleOpen = (role?: Role) => {
    if (role) {
      setEditId(role.id)
      setRoleName(role.name)
      setSelectedPerms(role.permissions.map(p => p.id))
    } else {
      setEditId(null)
      setRoleName("")
      setSelectedPerms([])
    }
    setOpen(true)
  }

  // 关闭弹窗
  const handleClose = () => {
    setOpen(false)
    setEditId(null)
    setRoleName("")
    setSelectedPerms([])
  }

  // 保存角色
  const handleSave = async () => {
    if (!roleName.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/roles/${editId}`, { name: roleName, permissions: selectedPerms });
        enqueueSnackbar('Role updated successfully', { variant: 'success' });
      } else {
        await api.post("/roles", { name: roleName, permissions: selectedPerms });
        enqueueSnackbar('Role created successfully', { variant: 'success' });
      }
      await fetchData();
      handleClose();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || "Failed to save role", { variant: 'error' });
    }
    setSaving(false);
  }

  // 删除角色
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await api.delete(`/roles/${id}`);
      setRoles(roles.filter(r => r.id !== id));
      enqueueSnackbar('Role deleted successfully', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar("Failed to delete role", { variant: 'error' });
    }
  }

  // 勾选权限
  const handlePermChange = (permId: number) => {
    setSelectedPerms(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  }

  // 全选/取消全选权限
  const handleSelectAll = () => {
    setSelectedPerms(prev =>
      prev.length === permissions.length ? [] : permissions.map(p => p.id)
    );
  }

  // 打开分配 Dialog
  const openAssignDialog = async () => {
    await fetchAllUsers();
    setAssigningUsers([]); // 可改为已分配用户
    setAssignDialogOpen(true);
  };

  // 分配角色给用户
  const handleAssignRole = async () => {
    try {
      await api.post("/roles/assign", {
        role_id: editId,
        user_ids: assigningUsers
      });
      setAssignDialogOpen(false);
      alert("Role assigned successfully!");
    } catch (e) {
      console.log(e);
      alert("Failed to assign role");
    }
  };

  // CustomTable columns
  const columns: Column[] = [
    {
      id: "actions",
      name: "Actions",
      align: "left",
      sortable: false,
      actions: [
        {
          label: "Edit",
          onClick: (row) => handleOpen(row),
          className: "bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white shadow-md",
          icon: <MdEdit />
        },
        {
          label: "Delete",
          onClick: (row) => handleDelete(row.id),
          className: "duration-300 bg-red-500 hover:bg-red-500/80 rounded-xl text-white shadow-md",
          icon: <MdDelete />
        }
      ]
    },
    { id: "name", name: "Role Name", sortable: true, align: "left" },
    {
      id: "permissions",
      name: "Permissions",
      sortable: false,
      align: "left",
      render: (value: Permission[]) => (
        <div className="grid grid-cols-2 gap-2 w-64">
          {value.map((p) => (
            <span key={p.id} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs text-nowrap">
              {p.name}
            </span>
          ))}
        </div>
      )
    },
  ];

  useEffect(() => {
    dispatch(setJumpPage(false))
  }, [])

  return (
    <Shell>
      <div className="flex h-16 justify-between items-center">
        <h1 className="text-2xl font-semibold">Role Management</h1>
        <button className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
          onClick={() => handleOpen()}
        >
          <MdAdd /> Add New Role
        </button>
      </div>
      <CustomTable columns={columns} data={roles} pagination={true} loading={loading} />
      {/* 新增/编辑 Drawer */}
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <div className="w-[400px] p-6">
          <h2 className="text-xl font-semibold mb-4">{editId ? "Edit Role" : "Add New Role"}</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <TextField
              label="Role Name"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              fullWidth
              autoFocus
              margin="normal"
            />
            <Divider className="my-4" />
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="subtitle2" color="textSecondary">Permissions</Typography>
                <Button size="small" onClick={handleSelectAll}>
                  {selectedPerms.length === permissions.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <FormGroup>
                {permissions.map((perm) => (
                  <FormControlLabel
                    key={perm.id}
                    control={
                      <Checkbox
                        checked={selectedPerms.includes(perm.id)}
                        onChange={() => handlePermChange(perm.id)}
                      />
                    }
                    label={perm.name}
                  />
                ))}
              </FormGroup>
            </div>
            {/*editId && (
              <Button
                variant="outlined"
                color="primary"
                onClick={openAssignDialog}
                fullWidth
              >
                Assign to Users
              </Button>
            )}*/}
            <div className="flex gap-2">
              <button
                type="button"
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                onClick={handleClose}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10 w-full`}
                disabled={saving || !roleName.trim()}
              >
                {saving ? <CircularProgress size={20} /> : "SAVE"}
              </button>
            </div>
          </form>
        </div>
      </Drawer>
      {/* Assign Role Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to Users</DialogTitle>
        <DialogContent>
          <List>
            {allUsers.map(user => (
              <ListItemButton
                key={user.id}
                selected={assigningUsers.includes(user.id)}
                onClick={() => {
                  setAssigningUsers(prev =>
                    prev.includes(user.id)
                      ? prev.filter(id => id !== user.id)
                      : [...prev, user.id]
                  );
                }}
                className={assigningUsers.includes(user.id) ? 'bg-blue-50' : ''}
              >
                <Checkbox checked={assigningUsers.includes(user.id)} tabIndex={-1} disableRipple />
                <ListItemText primary={user.name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignRole} disabled={assigningUsers.length === 0}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Shell>
  )
}

export default RolePage;