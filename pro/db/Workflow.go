package db

import (
	coreDB "github.com/GlobalArtInc/aldisui/db"
	"github.com/GlobalArtInc/aldisui/pkg/task_logger"
)

func WorkflowConditionMatches(status task_logger.TaskStatus, condition coreDB.WorkflowEdgeCondition) bool {
	return false
}

func ValidateWorkflowTemplate(d coreDB.WorkflowTemplateValidationStore, workflow coreDB.WorkflowTemplate) error {
	return nil
}

func WorkflowRootNode(workflow coreDB.WorkflowTemplate) (coreDB.WorkflowNode, error) {
	return coreDB.WorkflowNode{}, nil
}
