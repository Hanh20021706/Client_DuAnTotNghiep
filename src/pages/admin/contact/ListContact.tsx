import { Button, message, Modal, Space, Table, Tag, Tooltip } from 'antd'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import AdminPageHeader from '../../../components/AdminPageHeader'
import { getContactList, removeContacts } from '../../../features/Slide/contact/ContactSlide'
import { Helmet } from "react-helmet";
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { ContactType } from '../../../types/contact'
import { useGetAllContactQuery, useRemoveContactMutation } from '../../../services/contact'

const ListContact = () => {
  const { data: contacts = [] as ContactType[], isLoading, error } = useGetAllContactQuery(undefined)
  const [removeContact] = useRemoveContactMutation()


  const onRemoveContact = (id: any) => {
    Modal.confirm({
      title: "Bạn có muốn xóa người liên hệ này ?",
      onOk: () => {
        removeContact(id)
        message.success("Xóa liên hệ thành công")
      }
    })

  }


  // title 
  const headings = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Họ", dataIndex: "surname", key: "surname" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Lời nhắn", dataIndex: "message", key: "message" },

    {
      title: "Trạng thái", dataIndex: "status", key: "status", render: (_: any, { status }: any) => (
        <>
          {status == "0"
            ? <Tag color="volcano">Chưa liên hệ</Tag>
            : status == "1"
              ? <Tag color="geekblue">Đã liên hệ</Tag>
              : status == "2"
                ? <Tag color="yellow">Không liên hệ được</Tag>
                : status == "3"
                  ? <Tag color="green">Hẹn liên hệ sau</Tag>
                  : ""
          }
        </>
      ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: "createdAt",
      className: 'w-[130px]',
      render: ((value) => (
        <Tooltip title={value}>
          <span>{value}</span>
        </Tooltip>
      ))

    },
    {
      title: "Hành động",
      key: 'action',
      render: (recore: any) => (
        <Space size="middle">
          {/* <a href='edit/:id' >Edit</a> */}
          <NavLink type="primary" to={'/admin/contact/edit/' + recore.id}><Button type="primary" style={{ background: "#198754" }} >Sửa</Button></NavLink>
          {/* <button onClick={ () => onRemove(id)}>Remove</button> */}
          <Button type="primary" danger onClick={() => onRemoveContact(recore.id)} >Xóa</Button>
        </Space>
      )
    }
  ]

  // data
  const dataSourd = contacts?.map((item: any, index: any) => {
    return {
      key: index + 1,
      stt: index + 1,
      surname: item.surname,
      name: item.name,
      phone: item.phone,
      email: item.email,
      address: item.address,
      message: item.message,
      status: item.status,
      sendAds: item.sendAds,
      id: item._id,
      createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
    }
  })


  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Quản Lí Liên Hệ | Vian English</title>
      </Helmet>
      <AdminPageHeader breadcrumb={"Danh sách liên hệ"} />
      <Table columns={headings} dataSource={dataSourd}></Table>
    </div>
  )
}

export default ListContact