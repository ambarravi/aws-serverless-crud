const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME

exports.handler = async (event) => {
    try {
        // Validate input event
        if (!validateInput(event.body)) {
            return createResponse(400, { message: 'Invalid input' });
        }

        const { httpMethod, body } = event;
        const employee = JSON.parse(body);

        switch (httpMethod) {
            case 'POST':
                return await createEmployee(employee);
            case 'GET':
                return await getEmployee(employee.EmpID);
            case 'PUT':
                return await updateEmployee(employee);
            case 'DELETE':
                return await deleteEmployee(employee.EmpID);
            default:
                return createResponse(400, { message: 'Unsupported HTTP method' });
        }
    } catch (error) {
        console.error('Error:', error);
        return createResponse(500, { message: 'Internal server error' });
    }
};

function validateInput(body) {
    const employee = JSON.parse(body);
    return (
        employee.EmpID &&
        employee.Name &&
        employee.Surname &&
        employee.CIty
    );
}

async function createEmployee(employee) {
    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: employee
    }).promise();
    return createResponse(201, { message: 'Employee created successfully' });
}

async function getEmployee(empId) {
    const result = await dynamoDB.get({
        TableName: TABLE_NAME,
        Key: { EmpID: empId }
    }).promise();
    return createResponse(200, result.Item || { message: 'Employee not found' });
}

async function updateEmployee(employee) {
    await dynamoDB.update({
        TableName: TABLE_NAME,
        Key: { EmpID: employee.EmpID },
        UpdateExpression: 'set #name = :n, Surname = :s, CIty = :c',
        ExpressionAttributeNames: { '#name': 'Name' },
        ExpressionAttributeValues: {
            ':n': employee.Name,
            ':s': employee.Surname,
            ':c': employee.CIty
        }
    }).promise();
    return createResponse(200, { message: 'Employee updated successfully' });
}

async function deleteEmployee(empId) {
    await dynamoDB.delete({
        TableName: TABLE_NAME,
        Key: { EmpID: empId }
    }).promise();
    return createResponse(200, { message: 'Employee deleted successfully' });
}

function createResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}