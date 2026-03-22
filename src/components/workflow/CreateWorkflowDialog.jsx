import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Dialog from '../ui/Dialog';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import * as workflowService from '../../services/workflowService';

const CreateWorkflowDialog = ({ isOpen, onClose, onCreated }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setName('');
    setDescription('');
    setErrors({});
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Workflow name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await workflowService.create({
        name: name.trim(),
        description: description.trim(),
      });
      const workflow = res.data || res.workflow || res;
      const id = workflow._id || workflow.id;
      toast.success('Workflow created successfully');
      resetForm();
      onClose();
      onCreated?.();
      if (id) {
        navigate(`/workflows/${id}`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create workflow';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Create New Workflow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workflow Name"
          placeholder="e.g., Lead Generation Pipeline"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          autoFocus
        />
        <Textarea
          label="Description"
          placeholder="Briefly describe what this workflow does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Create Workflow
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateWorkflowDialog;
