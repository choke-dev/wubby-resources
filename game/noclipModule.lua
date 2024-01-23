--[[
    // Name: Noclip Module
    // Description: Allows a player to pass through walls.
    // Author: <@208876506146013185>
    // Version: 1.0.0

    Call with:
        local NoclipModule = require(path.to.this.modulescript)
        NoclipModule:Noclip()
        NoclipModule:Clip()
]]

local Players = game:GetService("Players")
local NoclipModule = {}

local isNoclipping = false
local NoclipConnection = nil
local NoclipDiedConnection = nil

function NoclipModule:Noclip()
    NoclipModule:Clip()
    isNoclipping = true
    local function NoclipLoop()
        if isNoclipping and Players.LocalPlayer.Character then
            for _, child in pairs(Players.LocalPlayer.Character:GetDescendants()) do
                if child:IsA("BasePart") and child.CanCollide then
                    child.CanCollide = false
                end
            end
        end
    end

    NoclipConnection = game:GetService('RunService').Stepped:Connect(NoclipLoop)
    NoclipDiedConnection = Players.LocalPlayer.Character.Humanoid.Died:Connect(function()
        NoclipModule:Clip()
    end)
end

function NoclipModule:Clip()
    if NoclipConnection then
        NoclipConnection:Disconnect()
        NoclipConnection = nil
    end

    if NoclipDiedConnection then
        NoclipDiedConnection:Disconnect()
        NoclipDiedConnection = nil
    end

    isNoclipping = false
    if not isNoclipping and Players.LocalPlayer.Character then
        for _, child in pairs(Players.LocalPlayer.Character:GetDescendants()) do
            if child:IsA("BasePart") and not child.CanCollide then
                child.CanCollide = true
            end
        end
    end
end

return NoclipModule
