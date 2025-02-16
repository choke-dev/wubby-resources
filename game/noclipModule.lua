local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local NoclipModule = {}
local isNoclipping = false
local noclipConnection = nil
local noclipDiedConnection = nil
local originalCanCollide = {}

function NoclipModule:Noclip()
    self:Clip()
    isNoclipping = true

    local function noclipLoop()
        local character = Players.LocalPlayer.Character
        if character then
            for _, part in ipairs(character:GetDescendants()) do
                if part:IsA("BasePart") and part.CanCollide then
                    if originalCanCollide[part] == nil then
                        originalCanCollide[part] = part.CanCollide
                    end
                    part.CanCollide = false
                end
            end
        end
    end

    noclipConnection = RunService.Stepped:Connect(noclipLoop)
    noclipDiedConnection = Players.LocalPlayer.Character:WaitForChild("Humanoid").Died:Connect(function()
        self:Clip()
    end)
end

function NoclipModule:Clip()
    if noclipConnection then
        noclipConnection:Disconnect()
        noclipConnection = nil
    end

    if noclipDiedConnection then
        noclipDiedConnection:Disconnect()
        noclipDiedConnection = nil
    end

    isNoclipping = false

    local character = Players.LocalPlayer.Character
    if character then
        for part, canCollide in pairs(originalCanCollide) do
            if part:IsA("BasePart") then
                part.CanCollide = canCollide
            end
        end
    end

    originalCanCollide = {}
end

return NoclipModule
