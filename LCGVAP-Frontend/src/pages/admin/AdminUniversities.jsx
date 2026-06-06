import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, InputNumber, Space, Popconfirm, message, Skeleton, Empty, Upload } from 'antd';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import getFileUrl from '../../utils/getFileUrl';

const AdminUniversities = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/universities');
            setUniversities(response.data);
        } catch (error) {
            console.error('Error fetching universities:', error);
            message.error('Failed to load universities');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.file;
        if (file.type.startsWith('image/')) {
            setLogoFile(file);
            setExistingLogoUrl(null); // Clear existing URL when new file is selected
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            message.error('Please upload an image file');
        }
    };

    const handleAddClick = () => {
        form.resetFields();
        setLogoFile(null);
        setLogoPreview(null);
        setExistingLogoUrl(null);
        setEditingId(null);
        setModalVisible(true);
    };

    const handleEditClick = (record) => {
        form.setFieldsValue({
            name: record.name,
            acronym: record.acronym,
            country: record.country,
            website_url: record.website_url,
            short_description: record.short_description,
            is_featured: record.is_featured || false,
            display_order: record.display_order || 0
        });
        // Store the relative path for saving, but show the full URL for preview
        setExistingLogoUrl(record.logo_url);
        setLogoPreview(record.logo_url ? getFileUrl(record.logo_url) : null);
        setLogoFile(null);
        setEditingId(record.id);
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            let logoUrl = existingLogoUrl;

            // If a new file was selected, upload it
            if (logoFile) {
                logoUrl = await uploadLogo(logoFile);
            }

            const data = {
                ...values,
                logo_url: logoUrl || ''
            };

            if (editingId) {
                await api.put(`/universities/${editingId}`, data);
                message.success('University updated successfully');
            } else {
                await api.post('/universities', data);
                message.success('University added successfully');
            }

            fetchUniversities();
            setModalVisible(false);
        } catch (error) {
            console.error('Error saving university:', error);
            message.error('Failed to save university');
        }
    };

    const uploadLogo = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await api.post('/upload/logo', formData);
            return response.data.url;
        } catch (error) {
            console.error('Upload error:', error);
            message.warning('Logo upload failed, but university can be saved');
            return null;
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/universities/${id}`);
            message.success('University deleted successfully');
            fetchUniversities();
        } catch (error) {
            console.error('Error deleting university:', error);
            message.error('Failed to delete university');
        }
    };

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'logo_url',
            key: 'logo',
            width: 100,
            render: (logo) => logo ? (
                <img src={getFileUrl(logo)} alt="logo" style={{ height: 40 }} />
            ) : (
                <span style={{ color: '#999' }}>No logo</span>
            )
        },
        {
            title: 'University Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: 'Acronym',
            dataIndex: 'acronym',
            key: 'acronym',
            width: 100
        },
        {
            title: 'Website',
            dataIndex: 'website_url',
            key: 'website',
            width: 200,
            render: (url) => url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            ) : '-'
        },
        {
            title: 'Featured',
            dataIndex: 'is_featured',
            key: 'featured',
            width: 100,
            render: (is_featured, record) => (
                <Switch
                    checked={is_featured}
                    onChange={() => handleToggleFeatured(record.id, is_featured)}
                />
            )
        },
        {
            title: 'Order',
            dataIndex: 'display_order',
            key: 'order',
            width: 80,
            sorter: (a, b) => a.display_order - b.display_order
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => handleEditClick(record)}
                    />
                    <Popconfirm
                        title="Delete University"
                        description="Are you sure you want to delete this university?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleToggleFeatured = async (id, currentStatus) => {
        try {
            await api.put(`/universities/${id}`, { is_featured: !currentStatus });
            message.success(`University ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
            fetchUniversities();
        } catch (error) {
            console.error('Error updating university:', error);
            message.error('Failed to update university');
        }
    };

    if (loading) {
        return <Skeleton active paragraph={{ rows: 10 }} />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>University Management</h1>
                <Button type="primary" size="large" onClick={handleAddClick}>
                    + Add University
                </Button>
            </div>

            {universities.length === 0 ? (
                <Empty description="No universities found" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={universities}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                    bordered
                />
            )}

            <Modal
                title={editingId ? 'Edit University' : 'Add New University'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ is_featured: false, display_order: 0 }}
                >
                    <Form.Item
                        label="University Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter university name' }]}
                    >
                        <Input placeholder="E.g., Near East University" />
                    </Form.Item>

                    <Form.Item
                        label="Acronym"
                        name="acronym"
                        rules={[{ required: true, message: 'Please enter acronym' }]}
                    >
                        <Input placeholder="E.g., NEU" />
                    </Form.Item>

                    <Form.Item
                        label="Country"
                        name="country"
                        rules={[{ required: true, message: 'Please enter country' }]}
                    >
                        <Input placeholder="E.g., Cyprus" />
                    </Form.Item>

                    <Form.Item
                        label="Website URL"
                        name="website_url"
                        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                    >
                        <Input placeholder="https://example.com" />
                    </Form.Item>

                    <Form.Item
                        label="Short Description"
                        name="short_description"
                    >
                        <Input.TextArea rows={3} placeholder="Brief description of the university" />
                    </Form.Item>

                    <Form.Item
                        label="University Logo"
                    >
                        <Upload
                            maxCount={1}
                            beforeUpload={(file) => {
                                if (!file.type.startsWith('image/')) {
                                    message.error('Please upload an image file');
                                    return false;
                                }
                                handleLogoChange({ file });
                                return false;
                            }}
                            customRequest={() => {}} // Prevent automatic upload
                            accept="image/*"
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload Logo</Button>
                        </Upload>
                    </Form.Item>

                    {logoPreview && (
                        <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                            <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Logo Preview:</p>
                            <img src={logoPreview} alt="preview" style={{ maxHeight: 100, maxWidth: '100%' }} onError={() => setLogoPreview(null)} />
                        </div>
                    )}

                    <Form.Item
                        label="Featured on Homepage"
                        name="is_featured"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="Display Order"
                        name="display_order"
                    >
                        <InputNumber min={0} placeholder="0" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUniversities;
